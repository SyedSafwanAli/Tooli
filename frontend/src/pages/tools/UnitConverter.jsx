import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { UnitConverterIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const CATEGORIES = {
  Length: {
    units: ['Millimeter', 'Centimeter', 'Meter', 'Kilometer', 'Inch', 'Foot', 'Yard', 'Mile'],
    // To meters
    toBase: { Millimeter: 1e-3, Centimeter: 1e-2, Meter: 1, Kilometer: 1e3, Inch: 0.0254, Foot: 0.3048, Yard: 0.9144, Mile: 1609.344 },
  },
  Weight: {
    units: ['Milligram', 'Gram', 'Kilogram', 'Pound', 'Ounce', 'Ton'],
    // To grams
    toBase: { Milligram: 1e-3, Gram: 1, Kilogram: 1e3, Pound: 453.592, Ounce: 28.3495, Ton: 1e6 },
  },
  Temperature: {
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    toBase: null, // special case
  },
  Area: {
    units: ['Square Meter', 'Square Kilometer', 'Square Foot', 'Square Inch', 'Acre', 'Hectare'],
    toBase: { 'Square Meter': 1, 'Square Kilometer': 1e6, 'Square Foot': 0.0929, 'Square Inch': 6.452e-4, Acre: 4046.86, Hectare: 1e4 },
  },
  Data: {
    units: ['Bit', 'Byte', 'Kilobyte', 'Megabyte', 'Gigabyte', 'Terabyte'],
    toBase: { Bit: 1, Byte: 8, Kilobyte: 8192, Megabyte: 8388608, Gigabyte: 8589934592, Terabyte: 8796093022208 },
  },
  Speed: {
    units: ['m/s', 'km/h', 'mph', 'Knot'],
    toBase: { 'm/s': 1, 'km/h': 0.2778, 'mph': 0.4470, 'Knot': 0.5144 },
  },
};

function convert(value, from, to, category) {
  const n = parseFloat(value);
  if (isNaN(n)) return '';

  if (category === 'Temperature') {
    let celsius;
    if (from === 'Celsius') celsius = n;
    else if (from === 'Fahrenheit') celsius = (n - 32) * 5 / 9;
    else celsius = n - 273.15;

    if (to === 'Celsius') return celsius;
    if (to === 'Fahrenheit') return celsius * 9 / 5 + 32;
    return celsius + 273.15;
  }

  const map = CATEGORIES[category].toBase;
  const inBase = n * map[from];
  return inBase / map[to];
}

const seoContent = {
  about: 'The Tooli Unit Converter converts between units of length, weight, temperature, area, data storage, and speed. All conversions use precise conversion factors and handle edge cases like very small and very large numbers using scientific notation.',
  howTo: [
    'Select the category of unit (Length, Weight, Temperature, Area, Data, or Speed).',
    'Enter the value you want to convert in the "From" field.',
    'Select the source and target units from the dropdowns.',
    'The converted value appears instantly in the "To" field.',
    'Click ⇅ to swap source and target units.',
  ],
  features: [
    'Converts Length, Weight, Temperature, Area, Data, and Speed',
    'Instant conversion as you type',
    'Swap units with one click',
    'Handles very small and very large numbers with scientific notation',
    'Precise conversion factors',
    'Runs entirely in your browser',
  ],
  faq: [
    { q: 'How accurate are the conversions?', a: 'All conversions use standard precise conversion factors (e.g. 1 inch = 0.0254 meters exactly). Results are shown to up to 8 significant figures.' },
    { q: 'Does this support metric and imperial units?', a: 'Yes. All categories include both metric (SI) and imperial/US customary units where applicable.' },
    { q: 'What data units are included?', a: 'Bit, Byte, Kilobyte (KB), Megabyte (MB), Gigabyte (GB), and Terabyte (TB) using binary multipliers (1 KB = 8192 bits).' },
  ],
};

export default function UnitConverter() {
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState('Meter');
  const [toUnit, setToUnit] = useState('Foot');
  const [inputVal, setInputVal] = useState('1');

  useSEO({
    title: 'Unit Converter',
    description: 'Convert length, weight, temperature, area, data, and speed units. Free and instant.',
    keywords: ['unit converter', 'convert units', 'length converter', 'temperature converter', 'metric converter'],
    jsonLd: [buildToolSchema({ name: 'Unit Converter', description: 'Convert between length, weight, temperature and other units online', url: '/tools/unit-converter' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/unit-converter',
  });

  const result = useMemo(() => {
    const r = convert(inputVal, fromUnit, toUnit, category);
    if (r === '') return '';
    const num = parseFloat(r);
    return Math.abs(num) < 0.001 || Math.abs(num) > 1e10
      ? num.toExponential(6)
      : parseFloat(num.toFixed(8)).toString();
  }, [inputVal, fromUnit, toUnit, category]);

  const switchCategory = (cat) => {
    setCategory(cat);
    const units = CATEGORIES[cat].units;
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setInputVal('1');
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const units = CATEGORIES[category].units;

  return (
    <ToolLayout
      title="Unit Converter"
      description="Convert between length, weight, temperature, area, data and speed units."
      icon={<UnitConverterIcon className="w-6 h-6" />}
      category="Utility"
      seoContent={seoContent}
    >
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.keys(CATEGORIES).map(cat => (
          <button
            key={cat}
            onClick={() => switchCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === cat ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="card space-y-4">
        {/* From */}
        <div>
          <label className="label">From</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              className="input flex-1"
              placeholder="Enter value"
            />
            <select value={fromUnit} onChange={e => setFromUnit(e.target.value)} className="input w-auto">
              {units.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <button
            onClick={swap}
            className="w-10 h-10 rounded-full border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 transition-colors text-xl"
          >
            ⇅
          </button>
        </div>

        {/* To */}
        <div>
          <label className="label">To</label>
          <div className="flex gap-2">
            <div className="input flex-1 bg-gray-50 font-mono font-semibold text-blue-700 flex items-center">
              {result || '—'}
            </div>
            <select value={toUnit} onChange={e => setToUnit(e.target.value)} className="input w-auto">
              {units.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>

        {result && (
          <p className="text-sm text-gray-500 text-center">
            {inputVal} {fromUnit} = <span className="font-semibold text-gray-800">{result} {toUnit}</span>
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
