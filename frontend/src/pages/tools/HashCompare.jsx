import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { HashCompareIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Hash Compare Tool lets you verify whether two hash strings are identical — useful for checking file integrity, validating API tokens, or confirming passwords. You can also generate a hash from plain text on the fly. All processing runs locally in your browser.',
  howTo: [
    'Paste the first hash into the "Hash A" field.',
    'Paste the second hash (or expected hash) into the "Hash B" field.',
    'A green Match or red No Match badge appears instantly.',
    'Optionally, generate a hash from plain text using the Generate Hash section.',
  ],
  features: [
    'Instant match / no-match comparison',
    'Case-insensitive comparison (ignores upper/lower)',
    'Leading/trailing whitespace ignored automatically',
    'Character-by-character diff for mismatched hashes',
    'On-the-fly SHA-256 / SHA-512 hash generation from text',
    '100% client-side — nothing sent to server',
  ],
  faq: [
    { q: 'Why would I compare two hashes?', a: 'Hash comparison is used to verify file integrity (e.g. checking a downloaded file matches the published SHA-256), validate API signatures, or confirm a stored hash matches a freshly computed one.' },
    { q: 'Is the comparison case-sensitive?', a: 'No. The tool normalises both hashes to lowercase before comparing, so "ABC123" and "abc123" are treated as equal.' },
    { q: 'What hash algorithms are supported for generation?', a: 'SHA-256 and SHA-512, using the browser\'s built-in Web Crypto API (SubtleCrypto). MD5 is not supported natively by Web Crypto.' },
  ],
};

async function hashText(text, algo) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algo, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HashCompare() {
  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');
  const [plainText, setPlainText] = useState('');
  const [algo, setAlgo] = useState('SHA-256');
  const [generated, setGenerated] = useState('');
  const [generating, setGenerating] = useState(false);

  useSEO({
    title: 'Hash Compare Tool',
    description: 'Compare two hash strings to check if they match. Verify file integrity, API tokens, or passwords. Generate SHA-256/SHA-512 hashes from text. Free, browser-based.',
    keywords: ['hash compare', 'compare hash strings', 'hash checker', 'verify hash', 'sha256 compare', 'hash integrity check'],
    jsonLd: [
      buildToolSchema({ name: 'Hash Compare Tool', description: 'Compare two hash strings and verify if they match', url: '/tools/hash-compare' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/hash-compare',
  });

  const comparison = useMemo(() => {
    const a = hashA.trim().toLowerCase();
    const b = hashB.trim().toLowerCase();
    if (!a || !b) return null;
    const match = a === b;
    if (match) return { match, diffChars: [] };
    // Character diff
    const maxLen = Math.max(a.length, b.length);
    const diffChars = Array.from({ length: maxLen }, (_, i) => ({
      char: a[i] ?? '',
      same: a[i] === b[i],
    }));
    return { match, diffChars };
  }, [hashA, hashB]);

  const handleGenerate = async () => {
    if (!plainText) return;
    setGenerating(true);
    try {
      const hash = await hashText(plainText, algo);
      setGenerated(hash);
    } finally {
      setGenerating(false);
    }
  };

  const copyGenerated = () => navigator.clipboard.writeText(generated);

  return (
    <ToolLayout
      title="Hash Compare Tool"
      description="Verify whether two hashes match. Case-insensitive diff and on-the-fly hash generation."
      icon={<HashCompareIcon className="w-6 h-6" />}
      category="Security"
      seoContent={seoContent}
    >
      {/* Compare section */}
      <div className="card space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Compare Hashes</p>
        <div>
          <label className="label">Hash A</label>
          <textarea
            className="input font-mono text-xs resize-none"
            rows={2}
            placeholder="Paste first hash here…"
            value={hashA}
            onChange={e => setHashA(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div>
          <label className="label">Hash B</label>
          <textarea
            className="input font-mono text-xs resize-none"
            rows={2}
            placeholder="Paste second hash here…"
            value={hashB}
            onChange={e => setHashB(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Result */}
        {comparison && (
          <div className={`rounded-xl border p-4 space-y-3 ${comparison.match ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className={`flex items-center gap-2 text-sm font-bold ${comparison.match ? 'text-green-700' : 'text-red-600'}`}>
              <span className="text-lg">{comparison.match ? '✓' : '✗'}</span>
              {comparison.match ? 'Match — hashes are identical' : 'No Match — hashes differ'}
            </div>

            {!comparison.match && comparison.diffChars.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Hash A — differing characters highlighted:</p>
                <div className="font-mono text-xs break-all leading-relaxed">
                  {comparison.diffChars.map((c, i) => (
                    <span
                      key={i}
                      className={c.same ? 'text-gray-600' : 'bg-red-200 text-red-700 rounded-sm'}
                    >{c.char || <span className="opacity-30">·</span>}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {(!hashA.trim() || !hashB.trim()) && (
          <p className="text-xs text-gray-400 text-center py-1">Paste two hashes above to compare them.</p>
        )}
      </div>

      {/* Generate hash */}
      <div className="card space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Generate Hash from Text</p>
        <div>
          <label className="label">Plain Text</label>
          <textarea
            className="input text-sm resize-none"
            rows={2}
            placeholder="Enter text to hash…"
            value={plainText}
            onChange={e => setPlainText(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="flex gap-3 items-end">
          <div>
            <label className="label">Algorithm</label>
            <select className="input" value={algo} onChange={e => setAlgo(e.target.value)}>
              <option>SHA-256</option>
              <option>SHA-512</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!plainText || generating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
        {generated && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{algo} hash:</span>
              <div className="flex gap-2">
                <button onClick={copyGenerated} className="text-xs text-blue-600 hover:underline">Copy</button>
                <button onClick={() => setHashA(generated)} className="text-xs text-blue-600 hover:underline">→ Hash A</button>
                <button onClick={() => setHashB(generated)} className="text-xs text-blue-600 hover:underline">→ Hash B</button>
              </div>
            </div>
            <code className="block bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono break-all text-gray-700">
              {generated}
            </code>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
