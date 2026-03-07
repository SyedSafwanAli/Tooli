import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import Button from '../../components/common/Button';
import { HashGeneratorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

async function hash(text, algorithm) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const ALGORITHMS = [
  { id: 'SHA-1', label: 'SHA-1' },
  { id: 'SHA-256', label: 'SHA-256' },
  { id: 'SHA-384', label: 'SHA-384' },
  { id: 'SHA-512', label: 'SHA-512' },
];

const seoContent = {
  about: 'The Tooli Hash Generator computes cryptographic hash digests of any text input using the browser\'s built-in SubtleCrypto API. It supports SHA-1, SHA-256, SHA-384, and SHA-512. No data is ever sent to a server.',
  howTo: [
    'Select the hashing algorithm (SHA-1, SHA-256, SHA-384, or SHA-512).',
    'Type or paste the text you want to hash into the input area.',
    'Click "Generate Hash".',
    'Copy the resulting hash with the "Copy" button.',
  ],
  features: [
    'Supports SHA-1, SHA-256, SHA-384, and SHA-512',
    'Uses browser\'s native Web Crypto SubtleCrypto API',
    'Shows hash length in bytes and hex characters',
    'One-click copy',
    'Runs entirely in your browser',
    'No data sent to any server',
  ],
  faq: [
    { q: 'What is a hash?', a: 'A cryptographic hash is a fixed-length fingerprint of data. The same input always produces the same hash, but even a tiny change in input produces a completely different hash. Hashes are one-way — you cannot recover the original text from a hash.' },
    { q: 'Which algorithm should I use?', a: 'SHA-256 is the most widely used and is recommended for general purposes. SHA-1 is considered weak and should not be used for security-sensitive applications. SHA-512 provides more security but produces a longer output.' },
    { q: 'Can I hash a file with this tool?', a: 'This tool hashes text input only. For file hashing, you would need a tool that reads the raw file bytes.' },
  ],
};

export default function HashGenerator() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA-256');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'Hash Generator',
    description: 'Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes from any text. Uses Web Crypto API.',
    keywords: ['hash generator', 'sha256', 'sha512', 'sha1', 'crypto hash', 'sha hash online'],
    jsonLd: [buildToolSchema({ name: 'Hash Generator', description: 'Generate SHA-256, SHA-512 and other hashes online', url: '/tools/hash-generator' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/hash-generator',
  });

  const generate = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const h = await hash(input, algorithm);
      setResult(h);
    } catch {
      setResult('Error generating hash');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Hash Generator"
      description="Generate cryptographic hashes using the browser's built-in Web Crypto API."
      icon={<HashGeneratorIcon className="w-6 h-6" />}
      category="Security"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        <div>
          <label className="label">Algorithm</label>
          <div className="flex gap-2 flex-wrap">
            {ALGORITHMS.map(a => (
              <button
                key={a.id}
                onClick={() => { setAlgorithm(a.id); setResult(''); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  algorithm === a.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Input Text</label>
          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setResult(''); }}
            rows={5}
            className="input resize-none font-mono text-sm"
            placeholder="Enter text to hash..."
          />
        </div>

        <Button onClick={generate} loading={loading} disabled={!input} className="w-full" size="lg">
          Generate {algorithm} Hash
        </Button>
      </div>

      {result && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-sm">{algorithm} Hash</span>
            <Button size="sm" variant="secondary" onClick={copy}>{copied ? '✅ Copied!' : 'Copy'}</Button>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-xs break-all text-gray-700 leading-relaxed">
            {result}
          </div>
          <p className="text-xs text-gray-400 mt-2">{result.length / 2} bytes ({result.length} hex characters)</p>
        </div>
      )}
    </ToolLayout>
  );
}
