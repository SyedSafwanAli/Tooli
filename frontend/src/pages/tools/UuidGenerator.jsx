import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { UuidGeneratorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

function generateV4() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Polyfill for older environments
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
  );
}

const FORMATS = [
  { id: 'standard', label: 'Standard',   fn: u => u },
  { id: 'upper',    label: 'UPPERCASE',  fn: u => u.toUpperCase() },
  { id: 'nodash',   label: 'No Dashes',  fn: u => u.replace(/-/g, '') },
  { id: 'braces',   label: '{Braces}',   fn: u => `{${u}}` },
];

const seoContent = {
  about: [
    'The Tooli UUID Generator creates RFC 4122 version 4 (random) UUIDs using the browser\'s cryptographically secure random number generator (Web Crypto API). No data is sent to any server — generation happens entirely in your browser.',
    'UUID v4 is the most widely used UUID version for generating unique identifiers in databases, APIs, and distributed systems. The probability of two random v4 UUIDs colliding is 1 in 2^122 — effectively zero for any real application.',
  ],
  howTo: [
    'Choose how many UUIDs you need (1–50) using the count input.',
    'Select the output format: standard lowercase, UPPERCASE, no-dashes, or braced.',
    'Click "Generate UUIDs" to create the list.',
    'Click any UUID to copy it individually, or "Copy All" for the entire list.',
  ],
  features: [
    'RFC 4122 v4 random UUIDs',
    'Cryptographically secure via Web Crypto API',
    'Bulk generation — up to 50 at once',
    'Standard, UPPERCASE, no-dash, and braced formats',
    'Click any UUID to copy individually',
    'Copy all as newline-separated list',
    'Zero data sent to any server',
  ],
  faq: [
    { q: 'What is a UUID?', a: 'A UUID (Universally Unique Identifier) is a 128-bit label standardised by RFC 4122 to uniquely identify information in computer systems. Version 4 UUIDs are randomly generated and formatted as 8-4-4-4-12 hexadecimal digits, e.g. 550e8400-e29b-41d4-a716-446655440000.' },
    { q: 'Are the generated UUIDs truly unique?', a: 'UUID v4 uses cryptographically secure randomness, making collisions statistically impossible. You would need to generate approximately 1 billion UUIDs per second for 100 years to have a 50% chance of even a single collision.' },
    { q: 'What is the difference between UUID and GUID?', a: 'GUID (Globally Unique Identifier) is Microsoft\'s name for UUID. They are the same 128-bit format. Windows systems typically wrap them in curly braces: {xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}.' },
    { q: 'Can I use these UUIDs in a database primary key?', a: 'Yes. UUID v4 is commonly used as a primary key in PostgreSQL (uuid type), MySQL, and MongoDB. For sequential insertion performance in large tables, consider UUID v7 (time-ordered) instead.' },
  ],
};

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [format, setFormat] = useState('standard');
  const [uuids, setUuids] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [copiedAll, setCopiedAll] = useState(false);

  useSEO({
    title: 'UUID Generator',
    description: 'Generate RFC 4122 v4 UUIDs online. Bulk UUID generator with standard, UPPERCASE, no-dash and braced formats. Secure, free, browser-based.',
    keywords: ['uuid generator', 'guid generator', 'random uuid', 'uuid v4', 'unique id generator', 'generate guid'],
    jsonLd: [
      buildToolSchema({ name: 'UUID Generator', description: 'Generate RFC 4122 v4 UUIDs online for free', url: '/tools/uuid-generator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/uuid-generator',
  });

  const formatFn = FORMATS.find(f => f.id === format)?.fn ?? (u => u);

  const generate = () => {
    setUuids(Array.from({ length: count }, () => formatFn(generateV4())));
  };

  const copyOne = async (idx) => {
    await navigator.clipboard.writeText(uuids[idx]);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const copyAll = async () => {
    await navigator.clipboard.writeText(uuids.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate RFC 4122 v4 UUIDs using a cryptographically secure random number generator."
      icon={<UuidGeneratorIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Count (1–50)</label>
            <input
              type="number"
              className="input"
              value={count}
              min={1}
              max={50}
              onChange={e => setCount(Math.min(50, Math.max(1, +e.target.value)))}
            />
          </div>
          <div>
            <label className="label">Format</label>
            <div className="grid grid-cols-2 gap-2">
              {FORMATS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setFormat(id)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    format === id
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-gray-200 text-gray-600 hover:border-purple-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
        >
          Generate UUIDs
        </button>
      </div>

      {uuids.length > 0 && (
        <div className="card space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">
              {uuids.length} UUID{uuids.length !== 1 ? 's' : ''} generated
            </span>
            <button onClick={copyAll} className="text-sm font-semibold text-purple-600 hover:text-purple-800">
              {copiedAll ? '✓ Copied All' : 'Copy All'}
            </button>
          </div>
          <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
            {uuids.map((uuid, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-purple-50 cursor-pointer transition-colors group"
                onClick={() => copyOne(i)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && copyOne(i)}
                aria-label={`Copy UUID ${uuid}`}
              >
                <code className="text-sm font-mono text-gray-700 break-all">{uuid}</code>
                <span className="text-xs text-gray-400 group-hover:text-purple-600 shrink-0 transition-colors">
                  {copiedIdx === i ? '✓' : 'copy'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
