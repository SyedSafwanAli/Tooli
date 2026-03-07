import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { UuidValidatorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli UUID Validator checks whether a string is a valid UUID (Universally Unique Identifier) and identifies its version (v1–v5) and variant. It also lets you generate new RFC 4122 v4 UUIDs instantly. All processing runs in your browser — nothing is sent to a server.',
  howTo: [
    'Paste a UUID string into the input field.',
    'The validator instantly shows if it is valid, its version, and variant.',
    'Click "Generate UUID v4" to create a new random UUID.',
    'Use the copy button to copy any UUID to your clipboard.',
  ],
  features: [
    'Validates UUIDs against RFC 4122 format',
    'Detects UUID version: v1, v2, v3, v4, v5',
    'Identifies UUID variant: RFC 4122, Microsoft, NCS, or future',
    'Normalises: accepts uppercase, lowercase, with or without braces',
    'Generate new RFC 4122 v4 UUIDs',
    'Bulk validation: paste multiple UUIDs one per line',
  ],
  faq: [
    { q: 'What is a UUID?', a: 'A UUID (Universally Unique Identifier) is a 128-bit label in the format xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx, standardised in RFC 4122. They are used as database primary keys and identifiers across distributed systems.' },
    { q: 'What is the difference between UUID versions?', a: 'v1 is time-based (includes host MAC address and timestamp). v3 and v5 are name-based (deterministic, using MD5 or SHA-1). v4 is randomly generated and most widely used. v2 is DCE security.' },
    { q: 'Is a nil UUID (all zeros) valid?', a: 'The nil UUID (00000000-0000-0000-0000-000000000000) is a valid RFC 4122 format but is a special-case placeholder. This tool reports it as valid with a "Nil UUID" label.' },
  ],
};

// RFC 4122 UUID regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIL_UUID = '00000000-0000-0000-0000-000000000000';

function normalise(input) {
  let s = input.trim();
  // Strip surrounding braces
  if (s.startsWith('{') && s.endsWith('}')) s = s.slice(1, -1).trim();
  return s.toLowerCase();
}

function detectVersion(uuid) {
  const vChar = uuid[14]; // position 14 is the version nibble
  const v = parseInt(vChar, 16);
  if (v >= 1 && v <= 5) return v;
  return null;
}

function detectVariant(uuid) {
  // Variant is encoded in the high bits of the 17th hex char (index 19)
  const c = parseInt(uuid[19], 16);
  if (c >= 0 && c <= 7)  return 'NCS (backward compatible)';
  if (c >= 8 && c <= 11) return 'RFC 4122';
  if (c >= 12 && c <= 13) return 'Microsoft (GUID)';
  return 'Future / Reserved';
}

function analyseUuid(raw) {
  if (!raw.trim()) return null;
  const normalised = normalise(raw);

  if (!UUID_REGEX.test(normalised)) {
    return { valid: false, normalised, raw };
  }

  const isNil = normalised === NIL_UUID;
  const version = isNil ? null : detectVersion(normalised);
  const variant = isNil ? null : detectVariant(normalised);

  return { valid: true, normalised, raw, version, variant, isNil };
}

function analyseBulk(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map(line => analyseUuid(line));
}

function generateV4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const SAMPLES = [
  '550e8400-e29b-41d4-a716-446655440000',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  '00000000-0000-0000-0000-000000000000',
  'not-a-valid-uuid-string',
];

export default function UuidValidator() {
  const [input, setInput] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [generated, setGenerated] = useState('');

  useSEO({
    title: 'UUID Validator',
    description: 'Validate UUID strings and detect version and variant. Generate RFC 4122 v4 UUIDs. Free, browser-based, instant.',
    keywords: ['uuid validator', 'uuid checker', 'validate uuid', 'uuid version', 'generate uuid', 'uuid v4'],
    jsonLd: [
      buildToolSchema({ name: 'UUID Validator', description: 'Validate and analyse UUID strings, detect version and variant', url: '/tools/uuid-validator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/uuid-validator',
  });

  const singleResult = useMemo(() => bulkMode ? null : analyseUuid(input), [input, bulkMode]);
  const bulkResults  = useMemo(() => bulkMode ? analyseBulk(input) : [], [input, bulkMode]);

  const validCount   = bulkResults.filter(r => r.valid).length;
  const invalidCount = bulkResults.filter(r => !r.valid).length;

  const handleGenerate = () => {
    const uuid = generateV4();
    setGenerated(uuid);
    if (!bulkMode) setInput(uuid);
  };

  const StatusBadge = ({ valid }) => (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {valid ? '✓ Valid' : '✗ Invalid'}
    </span>
  );

  return (
    <ToolLayout
      title="UUID Validator"
      description="Validate UUID strings and detect version and variant. Generate RFC 4122 v4 UUIDs instantly."
      icon={<UuidValidatorIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      {/* Generator + Mode toggle */}
      <div className="card py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleGenerate}
            className="text-sm px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Generate UUID v4
          </button>
          {generated && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <code className="text-xs font-mono text-gray-600 truncate">{generated}</code>
              <ResultActions copyText={generated} />
            </div>
          )}
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <div
              onClick={() => setBulkMode(b => !b)}
              className={`relative w-9 h-5 rounded-full transition-colors ${bulkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${bulkMode ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-gray-700">Bulk mode</span>
          </label>
        </div>
      </div>

      {/* Input */}
      <div className="card space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label">{bulkMode ? 'UUIDs (one per line)' : 'UUID to Validate'}</label>
            <button
              onClick={() => setInput(bulkMode ? SAMPLES.join('\n') : SAMPLES[0])}
              className="text-xs text-blue-600 hover:underline"
            >
              Load sample
            </button>
          </div>
          <textarea
            className="input font-mono text-sm resize-none"
            rows={bulkMode ? 6 : 2}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={bulkMode ? 'Paste UUIDs here, one per line…' : 'e.g. 550e8400-e29b-41d4-a716-446655440000'}
            spellCheck={false}
          />
        </div>

        {/* Single result */}
        {!bulkMode && singleResult && (
          <div className={`rounded-xl border p-4 space-y-3 ${singleResult.valid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <StatusBadge valid={singleResult.valid} />
              {singleResult.valid && <ResultActions copyText={singleResult.normalised} />}
            </div>

            {singleResult.valid ? (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Normalised</p>
                  <code className="font-mono text-gray-800 text-xs break-all">{singleResult.normalised}</code>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Version</p>
                  <p className="font-semibold text-gray-800">
                    {singleResult.isNil ? 'Nil UUID' : singleResult.version ? `v${singleResult.version}` : 'Unknown'}
                  </p>
                </div>
                {!singleResult.isNil && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Variant</p>
                    <p className="font-semibold text-gray-800">{singleResult.variant}</p>
                  </div>
                )}
                {singleResult.version && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Type</p>
                    <p className="font-semibold text-gray-800">
                      {singleResult.version === 1 ? 'Time-based'
                        : singleResult.version === 2 ? 'DCE Security'
                        : singleResult.version === 3 ? 'Name-based (MD5)'
                        : singleResult.version === 4 ? 'Random'
                        : singleResult.version === 5 ? 'Name-based (SHA-1)'
                        : 'Unknown'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600">
                Not a valid UUID. Expected format: <code className="font-mono">xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code>
              </p>
            )}
          </div>
        )}

        {/* Bulk results */}
        {bulkMode && bulkResults.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-green-700 font-semibold">{validCount} valid</span>
              <span className="text-gray-300">·</span>
              <span className="text-red-600 font-semibold">{invalidCount} invalid</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-500">{bulkResults.length} total</span>
            </div>
            <div className="space-y-1.5 max-h-80 overflow-y-auto">
              {bulkResults.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-mono ${r.valid ? 'bg-green-50' : 'bg-red-50'}`}
                >
                  <span className={r.valid ? 'text-green-600 shrink-0' : 'text-red-500 shrink-0'}>
                    {r.valid ? '✓' : '✗'}
                  </span>
                  <span className="truncate text-gray-700">{r.normalised || r.raw}</span>
                  {r.valid && r.version && (
                    <span className="ml-auto shrink-0 text-gray-400">v{r.version}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!input.trim() && (
          <p className="text-xs text-gray-400 text-center py-2">Paste a UUID above or generate one to get started.</p>
        )}
      </div>
    </ToolLayout>
  );
}
