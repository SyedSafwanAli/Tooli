import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TipCalculatorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Tip Calculator helps you quickly figure out the tip amount, total bill, and per-person split for any restaurant or service bill. Adjust the tip percentage with presets or a slider, and split the total among any number of people.',
  howTo: [
    'Enter the bill amount in the input field.',
    'Select a preset tip percentage or use the slider to set a custom amount.',
    'Set the number of people to split the bill between.',
    'The tip amount, total, and per-person share are shown instantly.',
  ],
  features: [
    'Quick preset tip buttons: 10%, 15%, 18%, 20%, 25%',
    'Smooth slider for custom tip percentages (0–30%)',
    'Split bill among any number of people (1–20)',
    'Shows tip amount, total bill, and per-person share',
    'Supports any currency amount with decimals',
    '100% client-side — no data sent to server',
  ],
  faq: [
    { q: 'What is a standard tip percentage?', a: '15–20% is standard in the US for restaurant service. 10% is considered low, and 25%+ is generous. For takeout, 10–15% is common.' },
    { q: 'How is the per-person amount calculated?', a: 'The total bill (original + tip) is divided equally among the number of people. Each person pays the same amount.' },
    { q: 'Can I round the per-person amount?', a: 'The calculator shows the exact amount. For easy splitting, you may want to round up to the nearest dollar.' },
  ],
};

const PRESETS = [10, 15, 18, 20, 25];

export default function TipCalculator() {
  const [bill, setBill] = useState('');
  const [tipPct, setTipPct] = useState(18);
  const [people, setPeople] = useState(1);

  useSEO({
    title: 'Tip Calculator',
    description: 'Calculate tip amount, total bill, and per-person split instantly. Choose preset percentages or set a custom tip. Free online tip calculator.',
    keywords: ['tip calculator', 'restaurant tip calculator', 'how much to tip', 'split bill calculator', 'tip percentage'],
    jsonLd: [
      buildToolSchema({ name: 'Tip Calculator', description: 'Calculate tip amount, total, and per-person split for any bill', url: '/tools/tip-calculator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/tip-calculator',
  });

  const result = useMemo(() => {
    const b = parseFloat(bill);
    if (!bill || isNaN(b) || b <= 0) return null;
    const tipAmt = b * (tipPct / 100);
    const total = b + tipAmt;
    const perPerson = total / Math.max(1, people);
    return { tipAmt, total, perPerson };
  }, [bill, tipPct, people]);

  const fmt = n => n.toFixed(2);

  return (
    <ToolLayout
      title="Tip Calculator"
      description="Calculate tip amount, total, and per-person split for any bill — instantly."
      icon={<TipCalculatorIcon className="w-6 h-6" />}
      category="Calculator"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Bill input */}
        <div>
          <label className="label">Bill Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input pl-7"
              placeholder="e.g. 85.00"
              value={bill}
              onChange={e => setBill(e.target.value)}
            />
          </div>
        </div>

        {/* Tip presets */}
        <div>
          <label className="label">Tip Percentage — <span className="text-blue-600 font-bold">{tipPct}%</span></label>
          <div className="flex gap-2 flex-wrap mb-3">
            {PRESETS.map(p => (
              <button
                key={p}
                onClick={() => setTipPct(p)}
                className={`text-sm px-3 py-1.5 rounded-lg font-semibold border transition-colors ${tipPct === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-400'}`}
              >
                {p}%
              </button>
            ))}
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="1"
            value={tipPct}
            onChange={e => setTipPct(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>30%</span>
          </div>
        </div>

        {/* People */}
        <div>
          <label className="label">Split Between</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPeople(p => Math.max(1, p - 1))}
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg transition-colors flex items-center justify-center"
            >−</button>
            <span className="text-xl font-bold text-gray-800 w-8 text-center tabular-nums">{people}</span>
            <button
              onClick={() => setPeople(p => Math.min(20, p + 1))}
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg transition-colors flex items-center justify-center"
            >+</button>
            <span className="text-sm text-gray-400">{people === 1 ? 'person' : 'people'}</span>
          </div>
        </div>

        {/* Results */}
        {result ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-amber-700">${fmt(result.tipAmt)}</div>
              <div className="text-xs text-amber-400 mt-1">Tip Amount</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-blue-700">${fmt(result.total)}</div>
              <div className="text-xs text-blue-400 mt-1">Total Bill</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-xl font-bold text-green-700">${fmt(result.perPerson)}</div>
              <div className="text-xs text-green-400 mt-1">Per Person</div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-2">Enter a bill amount to calculate the tip.</p>
        )}
      </div>
    </ToolLayout>
  );
}
