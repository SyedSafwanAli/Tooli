import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { PercentageCalculatorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Percentage Calculator handles three of the most common percentage problems: finding a percentage of a number, finding what percentage one number is of another, and calculating percentage change between two values. All calculations run instantly in your browser.',
  howTo: [
    'Select a calculation mode from the three tabs.',
    'Enter the required numbers in the input fields.',
    'The result and formula appear instantly below.',
    'Use the copy button to copy the result to your clipboard.',
  ],
  features: [
    'Mode 1: X% of Y — find a percentage of any number',
    'Mode 2: X is what % of Y — reverse percentage lookup',
    'Mode 3: % change from X to Y — increase or decrease',
    'Formula shown for each calculation',
    'Handles decimals and negative values',
    '100% client-side — no data sent to server',
  ],
  faq: [
    { q: 'How do I calculate 20% of 150?', a: 'Select "X% of Y", enter 20 for X and 150 for Y. The result is 30.' },
    { q: 'How do I find percentage increase?', a: 'Select "% Change from X to Y", enter the original value as X and the new value as Y. A positive result is an increase, negative is a decrease.' },
    { q: 'Can I use decimal percentages?', a: 'Yes. You can enter values like 2.5 or 0.5 in any field.' },
  ],
};

const MODES = [
  { id: 'of',      label: 'X% of Y' },
  { id: 'what',    label: 'X is what % of Y' },
  { id: 'change',  label: '% Change X → Y' },
];

function calculate(mode, a, b) {
  const x = parseFloat(a);
  const y = parseFloat(b);
  if (isNaN(x) || isNaN(y)) return null;

  if (mode === 'of') {
    const r = (x / 100) * y;
    return { result: r, formula: `${x}% × ${y} = ${+r.toFixed(6)}` };
  }
  if (mode === 'what') {
    if (y === 0) return { error: 'Cannot divide by zero.' };
    const r = (x / y) * 100;
    return { result: r, formula: `(${x} ÷ ${y}) × 100 = ${+r.toFixed(6)}%` };
  }
  if (mode === 'change') {
    if (x === 0) return { error: 'Original value cannot be zero.' };
    const r = ((y - x) / Math.abs(x)) * 100;
    const direction = r >= 0 ? 'increase' : 'decrease';
    return { result: r, direction, formula: `((${y} − ${x}) ÷ |${x}|) × 100 = ${+r.toFixed(6)}%` };
  }
  return null;
}

function fmt(n, mode) {
  const rounded = +n.toFixed(8);
  if (mode === 'what' || mode === 'change') return `${rounded}%`;
  return String(rounded);
}

export default function PercentageCalculator() {
  const [mode, setMode] = useState('of');
  const [a, setA] = useState('');
  const [b, setB] = useState('');

  useSEO({
    title: 'Percentage Calculator',
    description: 'Calculate percentages instantly — find X% of Y, what percentage X is of Y, or percentage change. Free, browser-based percentage calculator.',
    keywords: ['percentage calculator', 'percent calculator', 'percentage change calculator', 'what percent of', 'calculate percentage'],
    jsonLd: [
      buildToolSchema({ name: 'Percentage Calculator', description: 'Calculate percentages: X% of Y, reverse percentage, and percentage change', url: '/tools/percentage-calculator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/percentage-calculator',
  });

  const result = useMemo(() => calculate(mode, a, b), [mode, a, b]);

  const placeholders = {
    of:     ['Percentage (e.g. 20)', 'Number (e.g. 150)'],
    what:   ['Value (e.g. 30)',      'Total (e.g. 150)'],
    change: ['Original (e.g. 80)',   'New value (e.g. 100)'],
  };

  const labels = {
    of:     ['X (%)', 'Y (number)'],
    what:   ['X (value)', 'Y (total)'],
    change: ['X (original)', 'Y (new value)'],
  };

  return (
    <ToolLayout
      title="Percentage Calculator"
      description="Calculate percentages instantly — find X% of Y, reverse percentages, and percentage change."
      icon={<PercentageCalculatorIcon className="w-6 h-6" />}
      category="Calculator"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Mode tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setA(''); setB(''); }}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition-colors ${mode === m.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{labels[mode][0]}</label>
            <input
              type="number"
              className="input"
              placeholder={placeholders[mode][0]}
              value={a}
              onChange={e => setA(e.target.value)}
            />
          </div>
          <div>
            <label className="label">{labels[mode][1]}</label>
            <input
              type="number"
              className="input"
              placeholder={placeholders[mode][1]}
              value={b}
              onChange={e => setB(e.target.value)}
            />
          </div>
        </div>

        {/* Result */}
        {result?.error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{result.error}</div>
        )}

        {result && !result.error && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-2xl font-bold text-blue-700">
                {fmt(result.result, mode)}
                {result.direction && (
                  <span className={`ml-2 text-sm font-semibold ${result.direction === 'increase' ? 'text-green-600' : 'text-red-500'}`}>
                    {result.direction === 'increase' ? '▲' : '▼'} {result.direction}
                  </span>
                )}
              </span>
              <ResultActions copyText={fmt(result.result, mode)} />
            </div>
            <p className="text-xs text-blue-400 font-mono">{result.formula}</p>
          </div>
        )}

        {(!a || !b) && (
          <p className="text-xs text-gray-400 text-center py-2">Enter both values above to see the result.</p>
        )}
      </div>
    </ToolLayout>
  );
}
