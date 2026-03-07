import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { RandomNumberIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Random Number Generator produces cryptographically secure random integers using the Web Crypto API. Choose a minimum and maximum value, set how many numbers to generate (up to 10,000), and pick a separator. All generation happens in your browser — nothing is sent to a server.',
  howTo: [
    'Set the minimum and maximum values for your range.',
    'Enter how many random numbers to generate (1–10,000).',
    'Choose a separator: one per line, comma, space, or semicolon.',
    'Toggle "Allow duplicates" off to generate a unique set.',
    'Click "Generate" and then copy or download the result.',
  ],
  features: [
    'Cryptographically secure using crypto.getRandomValues()',
    'Range: any integers from -2,147,483,648 to 2,147,483,647',
    'Generate 1 to 10,000 numbers per click',
    'Optional unique mode — no repeated values',
    'Multiple separator options: newline, comma, space, semicolon',
    'Copy all or download as .txt',
  ],
  faq: [
    { q: 'Is this truly random?', a: 'Yes. The generator uses crypto.getRandomValues() — the Web Crypto API — which provides cryptographically secure pseudo-random numbers (CSPRNG). This is the same level of randomness used for security keys and tokens.' },
    { q: 'What is the maximum range size?', a: 'The generator supports any range of integers within the 32-bit signed integer range (−2,147,483,648 to 2,147,483,647). For the unique mode, the count cannot exceed the range size.' },
    { q: 'What does "no duplicates" mode do?', a: 'In unique mode, the generator uses a Fisher-Yates shuffle on the range to pick numbers without replacement. No number can appear more than once in the output.' },
  ],
};

const SEPARATORS = [
  { id: 'newline', label: 'New line', char: '\n' },
  { id: 'comma',   label: 'Comma',    char: ', ' },
  { id: 'space',   label: 'Space',    char: ' '  },
  { id: 'semi',    label: 'Semicolon', char: '; ' },
];

function secureRandInt(min, max) {
  const range = max - min + 1;
  const bytes = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / range) * range;
  let val;
  do {
    crypto.getRandomValues(bytes);
    val = bytes[0];
  } while (val >= limit);
  return min + (val % range);
}

export default function RandomNumber() {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(10);
  const [unique, setUnique] = useState(false);
  const [separator, setSeparator] = useState('newline');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  useSEO({
    title: 'Random Number Generator',
    description: 'Generate random numbers in any range online. Cryptographically secure using Web Crypto API. Supports unique mode, bulk generation, and multiple separators.',
    keywords: ['random number generator', 'random numbers', 'random integer', 'generate random numbers online', 'dice roller'],
    jsonLd: [
      buildToolSchema({ name: 'Random Number Generator', description: 'Generate cryptographically secure random numbers in any range', url: '/tools/random-number' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/random-number',
  });

  const generate = () => {
    setError('');
    const mn = parseInt(min), mx = parseInt(max), cnt = parseInt(count);
    if (isNaN(mn) || isNaN(mx) || mn > mx) { setError('Min must be less than or equal to Max.'); return; }
    if (cnt < 1 || cnt > 10000) { setError('Count must be between 1 and 10,000.'); return; }
    if (unique && cnt > (mx - mn + 1)) { setError(`Cannot generate ${cnt} unique numbers in range [${mn}, ${mx}] (only ${mx - mn + 1} values available).`); return; }

    const sep = SEPARATORS.find(s => s.id === separator).char;

    if (unique) {
      // Fisher-Yates partial shuffle on range
      const range = mx - mn + 1;
      const arr = Array.from({ length: range }, (_, i) => mn + i);
      for (let i = range - 1; i > range - cnt - 1; i--) {
        const j = secureRandInt(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      setResult(arr.slice(range - cnt).join(sep));
    } else {
      const nums = Array.from({ length: cnt }, () => secureRandInt(mn, mx));
      setResult(nums.join(sep));
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'random-numbers.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="Random Number Generator"
      description="Generate cryptographically secure random numbers in any range. Bulk generation, unique mode, multiple separators."
      icon={<RandomNumberIcon className="w-6 h-6" />}
      category="Utility"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Minimum</label>
            <input type="number" className="input" value={min} onChange={e => setMin(e.target.value)} />
          </div>
          <div>
            <label className="label">Maximum</label>
            <input type="number" className="input" value={max} onChange={e => setMax(e.target.value)} />
          </div>
        </div>

        {/* Count */}
        <div>
          <label className="label">How many? <span className="text-gray-400 font-normal">(1 – 10,000)</span></label>
          <input type="number" className="input" min={1} max={10000} value={count} onChange={e => setCount(e.target.value)} />
        </div>

        {/* Separator */}
        <div>
          <label className="label">Separator</label>
          <div className="flex flex-wrap gap-2">
            {SEPARATORS.map(s => (
              <button
                key={s.id}
                onClick={() => setSeparator(s.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  separator === s.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Unique toggle */}
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div
            onClick={() => setUnique(u => !u)}
            className={`relative w-9 h-5 rounded-full transition-colors ${unique ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${unique ? 'translate-x-4' : ''}`} />
          </div>
          <span className="text-sm text-gray-700">No duplicates</span>
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={generate}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
        >
          Generate
        </button>
      </div>

      {result && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold text-gray-900 text-sm">Result</h3>
            <ResultActions onDownload={handleDownload} downloadLabel="Download .txt" copyText={result} />
          </div>
          <textarea
            readOnly
            className="input resize-none font-mono text-sm bg-gray-50"
            rows={8}
            value={result}
          />
        </div>
      )}
    </ToolLayout>
  );
}
