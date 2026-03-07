import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { RomanNumeralIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Roman Numeral Converter converts decimal numbers to Roman numerals and Roman numerals back to decimal numbers. It handles standard Roman numeral rules including subtractive notation (IV = 4, IX = 9) and supports values from 1 to 3999.',
  howTo: [
    'Choose a direction: "Decimal to Roman" or "Roman to Decimal".',
    'Type your number in the input field.',
    'The result appears instantly below.',
    'Click "Copy" to copy the result to your clipboard.',
  ],
  features: [
    'Decimal → Roman and Roman → Decimal conversions',
    'Supports all standard Roman numerals (I, V, X, L, C, D, M)',
    'Handles subtractive notation (IV, IX, XL, XC, CD, CM)',
    'Valid range: 1 to 3999 for decimal input',
    'Input validation with helpful error messages',
    'Copy result with one click',
  ],
  faq: [
    { q: 'Why is the maximum value 3999?', a: 'Standard Roman numerals use M for 1000 and allow up to MMM (3000) plus DCCCXCIX (999), giving a maximum of 3999. Numbers above this traditionally required a bar over letters (vinculum), which is not supported in standard notation.' },
    { q: 'What is subtractive notation?', a: 'Subtractive notation places a smaller numeral before a larger one to indicate subtraction. IV = 5−1 = 4, IX = 10−1 = 9, XL = 50−10 = 40, XC = 100−10 = 90, CD = 500−100 = 400, CM = 1000−100 = 900.' },
    { q: 'Are lowercase Roman numerals supported?', a: 'Yes. The converter accepts both uppercase (XIV) and lowercase (xiv) input and always outputs uppercase Roman numerals.' },
  ],
};

const DECIMAL_MAP = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'],  [90, 'XC'],  [50, 'L'],  [40, 'XL'],
  [10, 'X'],   [9, 'IX'],   [5, 'V'],   [4, 'IV'],   [1, 'I'],
];

const ROMAN_MAP = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

function toRoman(n) {
  if (n < 1 || n > 3999) return null;
  let result = '';
  for (const [value, numeral] of DECIMAL_MAP) {
    while (n >= value) { result += numeral; n -= value; }
  }
  return result;
}

function fromRoman(str) {
  const s = str.toUpperCase().trim();
  if (!/^[IVXLCDM]+$/.test(s)) return null;
  let result = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = ROMAN_MAP[s[i]];
    const next = ROMAN_MAP[s[i + 1]];
    if (!cur) return null;
    result += next > cur ? -cur : cur;
  }
  // Validate by converting back
  if (toRoman(result) !== s) return null;
  return result;
}

const EXAMPLES = [
  { label: 'XIV = 14',    decimal: 14 },
  { label: 'XLII = 42',   decimal: 42 },
  { label: 'XCIX = 99',   decimal: 99 },
  { label: 'CDXLIV = 444', decimal: 444 },
  { label: 'MMXXIV = 2024', decimal: 2024 },
];

export default function RomanNumeral() {
  const [mode, setMode] = useState('toRoman'); // 'toRoman' | 'fromRoman'
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'Roman Numeral Converter',
    description: 'Convert decimal numbers to Roman numerals and back. Free online Roman numeral converter supporting 1–3999 with subtractive notation.',
    keywords: ['roman numeral converter', 'roman numerals', 'decimal to roman', 'roman to decimal', 'roman number converter'],
    jsonLd: [
      buildToolSchema({ name: 'Roman Numeral Converter', description: 'Convert between decimal and Roman numerals', url: '/tools/roman-numeral' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/roman-numeral',
  });

  const result = (() => {
    if (!input.trim()) return null;
    if (mode === 'toRoman') {
      const n = parseInt(input, 10);
      if (isNaN(n)) return { error: 'Please enter a valid integer.' };
      if (n < 1 || n > 3999) return { error: 'Value must be between 1 and 3999.' };
      return { value: toRoman(n), label: 'Roman numeral' };
    } else {
      const n = fromRoman(input);
      if (n === null) return { error: 'Invalid Roman numeral. Use I, V, X, L, C, D, M only.' };
      return { value: n.toString(), label: 'Decimal value' };
    }
  })();

  const copyResult = async () => {
    if (!result?.value) return;
    await navigator.clipboard.writeText(result.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadExample = (dec) => {
    if (mode === 'toRoman') {
      setInput(dec.toString());
    } else {
      setInput(toRoman(dec));
    }
  };

  return (
    <ToolLayout
      title="Roman Numeral Converter"
      description="Convert decimal numbers to Roman numerals and Roman numerals back to decimal."
      icon={<RomanNumeralIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      {/* Examples */}
      <div className="card py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 mr-1">Examples:</span>
          {EXAMPLES.map(ex => (
            <button
              key={ex.decimal}
              onClick={() => loadExample(ex.decimal)}
              className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 rounded-lg font-medium transition-colors"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-5">
        {/* Mode toggle */}
        <div>
          <label className="label">Conversion Direction</label>
          <div className="flex gap-3">
            {[
              { id: 'toRoman',   label: 'Decimal  →  Roman' },
              { id: 'fromRoman', label: 'Roman  →  Decimal' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setInput(''); }}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  mode === m.id
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-600 hover:border-purple-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="label">
            {mode === 'toRoman' ? 'Decimal Number (1 – 3999)' : 'Roman Numeral'}
          </label>
          <input
            type={mode === 'toRoman' ? 'number' : 'text'}
            className="input font-mono uppercase"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'toRoman' ? 'e.g. 2024' : 'e.g. MMXXIV'}
            min={mode === 'toRoman' ? 1 : undefined}
            max={mode === 'toRoman' ? 3999 : undefined}
            autoFocus
          />
        </div>

        {/* Result */}
        {result && (
          result.error ? (
            <p className="text-sm text-red-500 font-medium">{result.error}</p>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl">
              <div className="flex-1">
                <div className="text-xs text-purple-500 font-semibold mb-0.5">{result.label}</div>
                <div className="font-mono text-2xl font-bold text-purple-900">{result.value}</div>
              </div>
              <button
                onClick={copyResult}
                className="shrink-0 px-4 py-2 text-sm border border-purple-200 rounded-xl text-purple-600 hover:border-purple-400 font-semibold transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          )
        )}
      </div>
    </ToolLayout>
  );
}
