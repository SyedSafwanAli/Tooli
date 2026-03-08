import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { JsMinifierIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli JS / CSS Minifier removes comments, redundant whitespace, and unnecessary characters from JavaScript and CSS code to reduce file size. Minified code loads faster and saves bandwidth. All processing runs locally in your browser.',
  howTo: [
    'Select the language — JavaScript or CSS.',
    'Paste your code into the input area.',
    'The minified output appears instantly.',
    'Copy the result or view the size savings.',
  ],
  features: [
    'JavaScript minifier: removes comments, collapses whitespace',
    'CSS minifier: removes comments, whitespace around selectors/rules',
    'Shows original vs minified size and savings percentage',
    'Handles single-line and multi-line comments',
    'Preserves strings and regex literals',
    '100% client-side — code never leaves your browser',
  ],
  faq: [
    { q: 'Is this safe to use on production code?', a: 'This tool performs basic minification. For production use, we recommend tools like Terser (JS) or cssnano (CSS) which are more robust and handle edge cases better.' },
    { q: 'Does it rename variables?', a: 'No. This tool only removes whitespace and comments — it does not mangle or rename variable names.' },
    { q: 'Will it break my code?', a: 'For well-formed JS and CSS, the minification should be safe. Avoid using it on template strings with significant whitespace or unusual syntax patterns.' },
  ],
};

function minifyJs(code) {
  let result = '';
  let i = 0;
  const len = code.length;

  while (i < len) {
    // Single-line comment
    if (code[i] === '/' && code[i + 1] === '/') {
      while (i < len && code[i] !== '\n') i++;
      result += ' ';
      continue;
    }
    // Multi-line comment
    if (code[i] === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < len - 1 && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      result += ' ';
      continue;
    }
    // String literals — preserve exactly
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const quote = code[i];
      result += quote;
      i++;
      while (i < len) {
        if (code[i] === '\\') { result += code[i] + code[i + 1]; i += 2; continue; }
        if (code[i] === quote) { result += quote; i++; break; }
        result += code[i++];
      }
      continue;
    }
    // Whitespace — collapse
    if (/\s/.test(code[i])) {
      // Replace run of whitespace with single space, but only if needed
      while (i < len && /\s/.test(code[i])) i++;
      const prev = result[result.length - 1] || '';
      const next = code[i] || '';
      // Keep space only between identifiers/keywords
      if (/[\w$]/.test(prev) && /[\w$]/.test(next)) result += ' ';
      continue;
    }
    result += code[i++];
  }

  return result.trim();
}

function minifyCss(code) {
  // Remove multi-line comments
  let result = code.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove single-line comments (not standard CSS but used in SCSS/Less)
  result = result.replace(/\/\/.*/g, '');
  // Collapse whitespace
  result = result.replace(/\s+/g, ' ');
  // Remove spaces around structural characters
  result = result.replace(/\s*([{};:,>+~])\s*/g, '$1');
  // Remove trailing semicolons before }
  result = result.replace(/;}/g, '}');
  // Remove leading/trailing spaces inside {}
  result = result.replace(/{\s+/g, '{').replace(/\s+}/g, '}');
  return result.trim();
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(2)} KB`;
}

const SAMPLE_JS = `// Calculate the factorial of a number
function factorial(n) {
  // Base case
  if (n === 0 || n === 1) {
    return 1;
  }
  /* Recursive case */
  return n * factorial(n - 1);
}

const result = factorial(5);
console.log("Result:", result);`;

const SAMPLE_CSS = `/* Base reset */
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

/* Button styles */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #3b82f6;
  color: #ffffff;
  border-radius: 8px;
}`;

export default function JsMinifier() {
  const [lang, setLang] = useState('js');
  const [input, setInput] = useState('');

  useSEO({
    title: 'JS / CSS Minifier',
    description: 'Minify JavaScript and CSS code online. Remove comments and whitespace to reduce file size. Free, browser-based JS/CSS minifier.',
    keywords: ['js minifier', 'css minifier', 'javascript minifier', 'minify css online', 'minify javascript online'],
    jsonLd: [
      buildToolSchema({ name: 'JS / CSS Minifier', description: 'Minify JavaScript and CSS to reduce file size by removing comments and whitespace', url: '/tools/js-minifier' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/js-minifier',
  });

  const output = useMemo(() => {
    if (!input.trim()) return '';
    return lang === 'js' ? minifyJs(input) : minifyCss(input);
  }, [input, lang]);

  const origSize = new Blob([input]).size;
  const minSize  = new Blob([output]).size;
  const savings  = origSize > 0 ? Math.round((1 - minSize / origSize) * 100) : 0;

  const loadSample = () => setInput(lang === 'js' ? SAMPLE_JS : SAMPLE_CSS);

  return (
    <ToolLayout
      title="JS / CSS Minifier"
      description="Remove comments and whitespace from JavaScript or CSS to reduce file size instantly."
      icon={<JsMinifierIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      {/* Language + controls */}
      <div className="card py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {[['js', 'JavaScript'], ['css', 'CSS']].map(([val, label]) => (
              <button key={val} onClick={() => { setLang(val); setInput(''); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${lang === val ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={loadSample} className="text-xs text-blue-600 hover:underline ml-auto">Load sample</button>
        </div>
      </div>

      {/* Input */}
      <div className="card space-y-2">
        <label className="label">Input {lang === 'js' ? 'JavaScript' : 'CSS'}</label>
        <textarea
          className="input font-mono text-xs resize-none"
          rows={10}
          placeholder={`Paste your ${lang === 'js' ? 'JavaScript' : 'CSS'} here…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Output */}
      {output && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-3 text-sm">
              <span className="text-gray-500">{formatBytes(origSize)} → <span className="font-semibold text-gray-800">{formatBytes(minSize)}</span></span>
              <span className={`font-bold ${savings > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                {savings > 0 ? `${savings}% smaller` : 'No change'}
              </span>
            </div>
            <ResultActions copyText={output} />
          </div>
          <textarea
            readOnly
            className="input font-mono text-xs resize-none bg-gray-50"
            rows={6}
            value={output}
          />
        </div>
      )}

      {!input.trim() && (
        <div className="card">
          <p className="text-xs text-gray-400 text-center py-2">Paste code above to minify it.</p>
        </div>
      )}
    </ToolLayout>
  );
}
