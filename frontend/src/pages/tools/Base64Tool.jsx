import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import Button from '../../components/common/Button';
import { Base64Icon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Base64 Encoder/Decoder converts plain text to Base64 and back, entirely in your browser. Base64 is a binary-to-text encoding scheme widely used to embed binary data in JSON, HTML, CSS, and email. It is also commonly used to obfuscate simple strings, though it is not encryption.',
  howTo: [
    'Choose "Encode" to convert plain text to Base64, or "Decode" to reverse the process.',
    'Type or paste your text into the input area.',
    'Click the Encode or Decode button to process.',
    'Copy the output with the "Copy" button, or click "Swap & Decode/Encode" to continue working with the output.',
  ],
  features: [
    'Encode plain text to Base64',
    'Decode Base64 back to plain text',
    'Full Unicode/UTF-8 support',
    'Swap output back to input in one click',
    'One-click copy of result',
    'Runs entirely in your browser — no data sent anywhere',
  ],
  faq: [
    { q: 'Is Base64 the same as encryption?', a: 'No. Base64 is an encoding scheme, not encryption. Anyone can decode a Base64 string without a key. It is used to safely transport binary data as text, not to protect sensitive information.' },
    { q: 'Does this support Unicode characters?', a: 'Yes. The tool uses UTF-8 encoding so it handles all Unicode characters including emoji, Chinese, Arabic, and other non-ASCII text.' },
    { q: 'Is my data sent to a server?', a: 'No. All encoding and decoding is done in your browser using the built-in btoa() and atob() functions. No data leaves your device.' },
  ],
};

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'Base64 Encoder / Decoder',
    description: 'Encode or decode text to/from Base64 online. Free and instant.',
    keywords: ['base64 encoder', 'base64 decoder', 'encode base64', 'decode base64', 'base64 online'],
    jsonLd: [buildToolSchema({ name: 'Base64 Encoder / Decoder', description: 'Encode or decode text to/from Base64 online', url: '/tools/base64' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/base64',
  });

  const process = () => {
    setError('');
    try {
      if (mode === 'encode') {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input.trim()))));
      }
    } catch {
      setError(mode === 'decode' ? 'Invalid Base64 string' : 'Encoding failed');
      setOutput('');
    }
  };

  const swap = () => {
    setInput(output);
    setOutput('');
    setMode(m => (m === 'encode' ? 'decode' : 'encode'));
    setError('');
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Base64 Encoder / Decoder"
      description="Encode or decode text to/from Base64 format instantly."
      icon={<Base64Icon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        {/* Mode toggle */}
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
          <label className="label">{mode === 'encode' ? 'Text to Encode' : 'Base64 to Decode'}</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={6}
            className="input resize-none font-mono text-sm"
            placeholder={mode === 'encode' ? 'Enter plain text...' : 'Enter Base64 string...'}
          />
        </div>

        <div className="flex gap-3">
          <Button onClick={process} disabled={!input}>
            {mode === 'encode' ? 'Encode to Base64' : 'Decode from Base64'}
          </Button>
          {output && (
            <Button variant="secondary" onClick={swap}>⇅ Swap & {mode === 'encode' ? 'Decode' : 'Encode'}</Button>
          )}
        </div>

        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        {output && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="label mb-0">Output</label>
              <Button size="sm" variant="secondary" onClick={copy}>{copied ? '✅ Copied!' : 'Copy'}</Button>
            </div>
            <textarea
              readOnly
              value={output}
              rows={6}
              className="input resize-none font-mono text-sm bg-gray-50"
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
