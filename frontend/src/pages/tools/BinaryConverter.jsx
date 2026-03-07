import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { BinaryConverterIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Number Base Converter converts numbers between binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Type in any field and all other representations update instantly. Supports numbers up to 2^53 (JavaScript safe integer range).',
  howTo: [
    'Type a number into any of the four input fields — Binary, Octal, Decimal, or Hexadecimal.',
    'All other fields update instantly with the equivalent representation.',
    'Click the copy icon next to any field to copy that value.',
    'Use the Quick Values buttons to load common powers of two.',
  ],
  features: [
    'Simultaneous display in binary, octal, decimal, and hexadecimal',
    'Type in any base — all others update instantly',
    'Copy any representation with one click',
    'Input validation — shows error for invalid characters per base',
    'Quick values: 0, 255, 256, 1024, 65535, 16777215',
    'Works up to Number.MAX_SAFE_INTEGER (2^53 − 1)',
  ],
  faq: [
    { q: 'What is hexadecimal used for?', a: 'Hexadecimal (base 16) is widely used in computing to represent memory addresses, colour codes (e.g. #FF5733), byte values, and low-level data because 2 hex digits represent exactly 1 byte (8 bits).' },
    { q: 'Why does binary use only 0 and 1?', a: 'Binary (base 2) maps directly to transistor states in digital circuits — on (1) and off (0). All computer data is ultimately stored and processed as binary.' },
    { q: 'What is the maximum number supported?', a: 'The converter supports integers up to 2^53 − 1 (9,007,199,254,740,991) which is JavaScript\'s Number.MAX_SAFE_INTEGER. Larger numbers would require BigInt support.' },
  ],
};

const BASES = [
  { id: 'binary',  label: 'Binary',       base: 2,  prefix: '0b', placeholder: '11111111', chars: /^[01]+$/ },
  { id: 'octal',   label: 'Octal',        base: 8,  prefix: '0o', placeholder: '377',      chars: /^[0-7]+$/ },
  { id: 'decimal', label: 'Decimal',      base: 10, prefix: '',   placeholder: '255',       chars: /^[0-9]+$/ },
  { id: 'hex',     label: 'Hexadecimal',  base: 16, prefix: '0x', placeholder: 'FF',        chars: /^[0-9a-fA-F]+$/ },
];

const QUICK_VALUES = [0, 1, 7, 15, 255, 256, 1023, 1024, 65535, 16777215];

function fromDecimal(dec, base) {
  if (dec === '') return '';
  const n = parseInt(dec, 10);
  if (isNaN(n) || n < 0) return '';
  if (base === 16) return n.toString(16).toUpperCase();
  return n.toString(base);
}

export default function BinaryConverter() {
  const [decimal, setDecimal] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);

  useSEO({
    title: 'Number Base Converter',
    description: 'Convert numbers between binary, octal, decimal, and hexadecimal online. Type in any base and all others update instantly.',
    keywords: ['binary converter', 'hex converter', 'number base converter', 'binary to decimal', 'hex to decimal', 'base conversion'],
    jsonLd: [
      buildToolSchema({ name: 'Number Base Converter', description: 'Convert between binary, octal, decimal, and hexadecimal', url: '/tools/binary-converter' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/binary-converter',
  });

  const handleInput = (raw, base) => {
    const val = raw.trim();
    if (val === '') { setDecimal(''); setError(''); return; }
    const b = BASES.find(b => b.base === base);
    if (!b.chars.test(val)) { setError(`Invalid character for ${b.label}`); return; }
    const dec = parseInt(val, base);
    if (isNaN(dec) || dec > Number.MAX_SAFE_INTEGER) { setError('Number too large'); return; }
    setDecimal(dec.toString(10));
    setError('');
  };

  const loadQuick = (n) => {
    setDecimal(n.toString(10));
    setError('');
  };

  const copyVal = async (val) => {
    await navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <ToolLayout
      title="Number Base Converter"
      description="Convert between binary, octal, decimal, and hexadecimal. Type in any field to update all bases instantly."
      icon={<BinaryConverterIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      {/* Quick values */}
      <div className="card py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 mr-1">Quick values:</span>
          {QUICK_VALUES.map(n => (
            <button
              key={n}
              onClick={() => loadQuick(n)}
              className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-purple-100 text-gray-600 hover:text-purple-700 rounded-lg font-mono font-medium transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        {BASES.map(({ id, label, base, prefix, placeholder }) => {
          const display = base === 10 ? decimal : fromDecimal(decimal, base);
          return (
            <div key={id}>
              <label className="label flex items-center justify-between">
                <span>{label} <span className="text-gray-400 font-normal text-xs">base {base}</span></span>
                {prefix && <span className="font-mono text-xs text-gray-400">{prefix}</span>}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode={base === 10 ? 'numeric' : 'text'}
                  className="input flex-1 font-mono"
                  value={display}
                  onChange={e => handleInput(e.target.value, base)}
                  placeholder={placeholder}
                />
                <button
                  onClick={() => copyVal(display)}
                  disabled={!display}
                  className="shrink-0 px-3 py-2 text-xs border border-gray-200 rounded-xl text-gray-500 hover:border-purple-300 hover:text-purple-600 disabled:opacity-30 transition-colors font-medium"
                >
                  {copied === display ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
          );
        })}

        {error && (
          <p className="text-xs text-red-500 font-medium">{error}</p>
        )}
      </div>

      {decimal && (
        <div className="card bg-gray-50">
          <p className="text-xs text-gray-500 font-semibold mb-2">All representations of <span className="font-mono text-gray-800">{decimal}</span></p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BASES.map(({ id, label, base, prefix }) => {
              const val = base === 10 ? decimal : fromDecimal(decimal, base);
              return (
                <div key={id} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                  <div className="text-xs text-gray-400 mb-1">{label}</div>
                  <div className="font-mono text-sm font-bold text-gray-800 break-all">{prefix}{val}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
