import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import Button from '../../components/common/Button';
import { UrlEncoderIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli URL Encoder/Decoder converts URLs and query string parameters to percent-encoded format and back. URL encoding replaces characters that are not allowed in URLs (like spaces, &, and =) with a % followed by two hexadecimal digits.',
  howTo: [
    'Select "Encode" to convert a plain URL to percent-encoded format, or "Decode" to reverse it.',
    'Paste your URL or query string into the input area.',
    'Click the Encode / Decode button.',
    'Copy the result with the "Copy" button.',
  ],
  features: [
    'Encode URLs using encodeURIComponent',
    'Decode percent-encoded URLs',
    'Handles all special characters including spaces, &, =, ?',
    'One-click copy of output',
    'Runs entirely in your browser',
    'Instant — no button press delay',
  ],
  faq: [
    { q: 'When do I need to URL encode?', a: 'When passing a URL as a query parameter, or when a URL contains characters like spaces, &, =, or # that have special meaning in URLs. For example: ?redirect=https%3A%2F%2Fexample.com.' },
    { q: 'What is the difference between encodeURI and encodeURIComponent?', a: 'encodeURI encodes a full URL and preserves : / ? & = characters. encodeURIComponent encodes individual components (like query values) and also escapes those characters. This tool uses encodeURIComponent.' },
    { q: 'Is my URL sent to a server?', a: 'No. URL encoding and decoding are performed entirely in your browser using JavaScript built-in functions. No data is transmitted.' },
  ],
};

export default function UrlEncoder() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'URL Encoder / Decoder',
    description: 'Encode or decode URLs and query strings online. Free and instant.',
    keywords: ['url encoder', 'url decoder', 'encode url', 'decode url', 'uri encoding', 'percent encoding'],
    jsonLd: [buildToolSchema({ name: 'URL Encoder / Decoder', description: 'Encode and decode URLs and query strings online', url: '/tools/url-encoder' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/url-encoder',
  });

  const process = () => {
    setError('');
    try {
      setOutput(mode === 'encode' ? encodeURIComponent(input) : decodeURIComponent(input));
    } catch {
      setError('Invalid input — could not decode');
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="URL Encoder / Decoder"
      description="Encode and decode URLs and query string parameters."
      icon={<UrlEncoderIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
          {['encode', 'decode'].map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setOutput(''); setError(''); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                mode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div>
          <label className="label">{mode === 'encode' ? 'URL / Text to Encode' : 'Encoded URL to Decode'}</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={4}
            className="input resize-none font-mono text-sm"
            placeholder={mode === 'encode'
              ? 'https://example.com/path?q=hello world&lang=en'
              : 'https%3A%2F%2Fexample.com%2Fpath%3Fq%3Dhello%20world'}
          />
        </div>

        <Button onClick={process} disabled={!input}>
          {mode === 'encode' ? 'Encode URL' : 'Decode URL'}
        </Button>

        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Output</label>
              <Button size="sm" variant="secondary" onClick={copy}>{copied ? '✅ Copied!' : 'Copy'}</Button>
            </div>
            <textarea readOnly value={output} rows={4} className="input resize-none font-mono text-sm bg-gray-50" />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
