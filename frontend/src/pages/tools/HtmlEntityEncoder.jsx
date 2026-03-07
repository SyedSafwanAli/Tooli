import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { HtmlEntityEncoderIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const ENTITY_MAP = [
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ['"', '&quot;'],
  ["'", '&#39;'],
];

function encode(text) {
  return ENTITY_MAP.reduce((t, [ch, ent]) => t.split(ch).join(ent), text);
}

function decode(text) {
  // Use a textarea element for reliable browser-native decoding
  const el = document.createElement('textarea');
  el.innerHTML = text;
  return el.value;
}

const QUICK_REF = [
  ...ENTITY_MAP,
  ['©', '&copy;'],
  ['®', '&reg;'],
  ['™', '&trade;'],
  ['€', '&euro;'],
  ['£', '&pound;'],
  ['¥', '&yen;'],
  ['×', '&times;'],
  ['÷', '&divide;'],
  ['±', '&plusmn;'],
  ['°', '&deg;'],
  ['→', '&rarr;'],
  ['←', '&larr;'],
  [' ', '&nbsp;'],
];

const seoContent = {
  about: [
    'The Tooli HTML Entity Encoder/Decoder converts special characters to their named or numeric HTML entity equivalents and back. Encoding is essential for safe HTML generation — it prevents cross-site scripting (XSS) attacks by ensuring user-supplied content is treated as text, not markup.',
    'The decoder uses the browser\'s native HTML parser, so it handles all named entities (e.g. &amp;copy;), decimal numeric entities (&amp;#169;), and hex numeric entities (&amp;#xA9;) with full accuracy.',
  ],
  howTo: [
    'Select "Encode" mode to convert special characters to HTML entities.',
    'Select "Decode" mode to convert HTML entities back to readable characters.',
    'Paste your text into the input box — the output updates instantly.',
    'Click "Copy Output" to copy the result to your clipboard.',
    'Use the Quick Reference table to find any entity you need.',
  ],
  features: [
    'Encodes &, <, >, ", \' to safe HTML entities',
    'Decodes all named and numeric HTML entities',
    'Real-time conversion as you type',
    'Browser-native decoding — handles all standard entities',
    'Quick reference table with 14 common entities',
    'Zero data sent to any server',
  ],
  faq: [
    { q: 'What are HTML entities?', a: 'HTML entities are special codes that represent characters reserved by HTML syntax or unavailable on standard keyboards. For example, & must be written as &amp; and < as &lt; to prevent browsers from parsing them as HTML tags.' },
    { q: 'When do I need to encode HTML entities?', a: 'Always encode user-generated content before inserting it into HTML to prevent XSS attacks. Also encode content in HTML attributes, inside <script> data-values, and when displaying code samples containing HTML characters.' },
    { q: 'What is the difference between named and numeric entities?', a: 'Named entities use descriptive names (&amp;copy; for ©). Numeric entities use the Unicode code point in decimal (&amp;#169;) or hex (&amp;#xA9;). All three are equivalent — browsers render them identically.' },
    { q: 'Does encoding protect against XSS?', a: 'HTML entity encoding is one layer of XSS defence. It prevents script injection when inserting user content into HTML text nodes. For attributes, URLs, and JavaScript contexts, additional escaping rules apply. Always use a dedicated security library for production applications.' },
  ],
};

export default function HtmlEntityEncoder() {
  const [mode, setMode] = useState('encode');
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'HTML Entity Encoder / Decoder',
    description: 'Encode and decode HTML entities online. Convert &, <, > and special characters to safe HTML entities and back. Free, instant, browser-based.',
    keywords: ['html entity encoder', 'html entity decoder', 'html escape', 'html unescape', 'html entities', 'xss prevention'],
    jsonLd: [
      buildToolSchema({ name: 'HTML Entity Encoder/Decoder', description: 'Encode and decode HTML entities online', url: '/tools/html-entity-encoder' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/html-entity-encoder',
  });

  const output = input ? (mode === 'encode' ? encode(input) : decode(input)) : '';

  const copy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="HTML Entity Encoder / Decoder"
      description="Encode and decode HTML entities to make special characters safe for use in HTML."
      icon={<HtmlEntityEncoderIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Mode toggle */}
        <div>
          <label className="label">Mode</label>
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            {['encode', 'decode'].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
                  mode === m ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-purple-50'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div>
          <label className="label">
            {mode === 'encode' ? 'Raw Text (with special characters)' : 'HTML Entities (to decode)'}
          </label>
          <textarea
            className="input resize-none font-mono text-sm"
            rows={6}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              mode === 'encode'
                ? 'e.g. <h1>Hello & "World" © 2024</h1>'
                : 'e.g. &lt;h1&gt;Hello &amp; &quot;World&quot; &copy; 2024&lt;/h1&gt;'
            }
          />
        </div>

        {/* Output */}
        {output && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="label mb-0">
                {mode === 'encode' ? 'HTML-safe Output' : 'Decoded Text'}
              </label>
              <button onClick={copy} className="text-sm font-semibold text-purple-600 hover:text-purple-800">
                {copied ? '✓ Copied' : 'Copy Output'}
              </button>
            </div>
            <textarea
              readOnly
              className="input resize-none font-mono text-sm bg-gray-50"
              rows={6}
              value={output}
            />
          </div>
        )}
      </div>

      {/* Quick reference */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Common HTML Entities — Quick Reference</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {QUICK_REF.map(([char, entity]) => (
            <button
              key={entity}
              onClick={() => { setInput(char); setMode('encode'); }}
              className="flex items-center gap-2 text-xs text-left hover:bg-purple-50 rounded-lg px-2 py-1.5 transition-colors group"
              title={`Click to encode "${char === ' ' ? 'space' : char}"`}
            >
              <code className="bg-gray-100 group-hover:bg-purple-100 px-2 py-1 rounded font-bold w-8 text-center text-gray-700 shrink-0 transition-colors">
                {char === ' ' ? '⎵' : char}
              </code>
              <span className="text-gray-400">→</span>
              <code className="font-mono text-purple-700 truncate">{entity}</code>
            </button>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
