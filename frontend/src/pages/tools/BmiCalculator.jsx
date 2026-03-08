import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { BmiCalculatorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli BMI Calculator computes your Body Mass Index from your height and weight. It supports both Metric (kg/cm) and Imperial (lbs/ft+in) units and shows your BMI category — Underweight, Normal, Overweight, or Obese — along with a visual scale. All processing is done locally in your browser.',
  howTo: [
    'Choose your preferred unit system: Metric or Imperial.',
    'Enter your height and weight.',
    'Your BMI and category are shown instantly below.',
    'Review the BMI scale to see where your value falls.',
  ],
  features: [
    'Supports Metric (kg, cm) and Imperial (lbs, ft/in)',
    'Calculates BMI to two decimal places',
    'Color-coded category: Underweight / Normal / Overweight / Obese',
    'Visual BMI scale with your position marked',
    'WHO category thresholds used',
    '100% client-side — no data sent to server',
  ],
  faq: [
    { q: 'What is a healthy BMI?', a: 'According to the WHO, a BMI of 18.5–24.9 is considered Normal/Healthy weight. Below 18.5 is Underweight, 25–29.9 is Overweight, and 30+ is Obese.' },
    { q: 'Is BMI an accurate health measure?', a: 'BMI is a simple screening tool, not a diagnostic measure. It does not account for muscle mass, age, sex, or ethnicity. Consult a healthcare professional for a full health assessment.' },
    { q: 'How is BMI calculated?', a: 'BMI = weight (kg) ÷ height² (m²). For Imperial units, the tool first converts lbs to kg and feet/inches to metres, then applies the same formula.' },
  ],
};

const CATEGORIES = [
  { label: 'Underweight', range: [0, 18.5],  color: 'text-blue-600',  bg: 'bg-blue-50',  border: 'border-blue-200',  bar: 'bg-blue-400' },
  { label: 'Normal',      range: [18.5, 25],  color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500' },
  { label: 'Overweight',  range: [25, 30],    color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', bar: 'bg-yellow-400' },
  { label: 'Obese',       range: [30, Infinity], color: 'text-red-600', bg: 'bg-red-50',  border: 'border-red-200',  bar: 'bg-red-500' },
];

function getCategory(bmi) {
  return CATEGORIES.find(c => bmi >= c.range[0] && bmi < c.range[1]) || CATEGORIES[3];
}

// Position on a 0–40 BMI scale
function bmiBarPct(bmi) {
  return Math.min(100, Math.max(0, (bmi / 40) * 100));
}

function computeBmi(unit, weight, height, feet, inches) {
  let kg, m;
  if (unit === 'metric') {
    kg = parseFloat(weight);
    m = parseFloat(height) / 100;
  } else {
    kg = parseFloat(weight) * 0.453592;
    const totalIn = (parseFloat(feet) || 0) * 12 + (parseFloat(inches) || 0);
    m = totalIn * 0.0254;
  }
  if (!kg || !m || kg <= 0 || m <= 0) return null;
  const bmi = kg / (m * m);
  return { bmi: +bmi.toFixed(2), ...getCategory(bmi) };
}

export default function BmiCalculator() {
  const [unit, setUnit] = useState('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');

  useSEO({
    title: 'BMI Calculator',
    description: 'Calculate your Body Mass Index (BMI) with Metric or Imperial units. Instant result with category and visual scale. Free online BMI calculator.',
    keywords: ['bmi calculator', 'body mass index calculator', 'bmi metric imperial', 'healthy weight calculator', 'bmi chart'],
    jsonLd: [
      buildToolSchema({ name: 'BMI Calculator', description: 'Calculate Body Mass Index with Metric or Imperial units', url: '/tools/bmi-calculator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/bmi-calculator',
  });

  const result = useMemo(
    () => computeBmi(unit, weight, height, feet, inches),
    [unit, weight, height, feet, inches]
  );

  const hasInput = unit === 'metric' ? (weight && height) : (weight && (feet || inches));

  return (
    <ToolLayout
      title="BMI Calculator"
      description="Calculate your Body Mass Index instantly with Metric or Imperial units."
      icon={<BmiCalculatorIcon className="w-6 h-6" />}
      category="Calculator"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Unit toggle */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {['metric', 'imperial'].map(u => (
            <button
              key={u}
              onClick={() => { setUnit(u); setWeight(''); setHeight(''); setFeet(''); setInches(''); }}
              className={`px-5 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize ${unit === u ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Height + Weight */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Weight */}
          <div>
            <label className="label">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
            <input
              type="number"
              min="0"
              step="0.1"
              className="input"
              placeholder={unit === 'metric' ? 'e.g. 70' : 'e.g. 154'}
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
          </div>

          {/* Height */}
          {unit === 'metric' ? (
            <div>
              <label className="label">Height (cm)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                className="input"
                placeholder="e.g. 175"
                value={height}
                onChange={e => setHeight(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className="label">Height</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    className="input pr-8"
                    placeholder="5"
                    value={feet}
                    onChange={e => setFeet(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">ft</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    className="input pr-8"
                    placeholder="9"
                    value={inches}
                    onChange={e => setInches(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">in</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        {result ? (
          <>
            <div className={`rounded-xl border p-5 text-center ${result.bg} ${result.border}`}>
              <div className={`text-5xl font-bold tabular-nums ${result.color}`}>{result.bmi}</div>
              <div className={`text-sm font-semibold mt-1 ${result.color}`}>{result.label}</div>
            </div>

            {/* Scale bar */}
            <div>
              <div className="relative h-4 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-blue-300" />
                <div className="flex-[1.3] bg-green-400" />
                <div className="flex-1 bg-yellow-400" />
                <div className="flex-1 bg-red-400" />
              </div>
              {/* Needle */}
              <div className="relative h-0" style={{ marginTop: '-1.15rem' }}>
                <div
                  className="absolute -translate-x-1/2 w-0.5 h-5 bg-gray-800 rounded-full"
                  style={{ left: `${bmiBarPct(result.bmi)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-4">
                <span>0</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40+</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                <span className="text-blue-400">Under</span>
                <span className="text-green-500 ml-4">Normal</span>
                <span className="text-yellow-500">Over</span>
                <span className="text-red-500">Obese</span>
              </div>
            </div>
          </>
        ) : (
          !hasInput && <p className="text-xs text-gray-400 text-center py-2">Enter your height and weight to calculate BMI.</p>
        )}
      </div>
    </ToolLayout>
  );
}
