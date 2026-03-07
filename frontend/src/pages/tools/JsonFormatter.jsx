import { useState, useCallback } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import Button from '../../components/common/Button';
import { JsonFormatterIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli JSON Formatter parses, validates, and beautifies JSON data in your browser. It highlights syntax errors with descriptive messages, formats JSON with your chosen indentation, and can minify JSON to the smallest possible size for production use.',
  howTo: [
    'Paste your JSON into the Input JSON text area (or click "Load sample" to try an example).',
    'Click "Beautify" to format with indentation, "Minify" to compact, or "Validate" to check for errors.',
    'Adjust the indentation setting (2 spaces, 4 spaces, or tabs).',
    'Copy the formatted output using the "Copy" button.',
  ],
  features: [
    'Syntax error detection with descriptive messages',
    'Beautify with 2 spaces, 4 spaces, or tab indentation',
    'Minify JSON for production builds',
    'One-click copy of output',
    'Runs entirely in your browser',
    'Works with JSON of any size',
  ],
  faq: [
    { q: 'Does this tool validate JSON?', a: 'Yes. Click the "Validate" button to check whether your JSON is syntactically valid. Any errors are shown with the exact position of the problem.' },
    { q: 'What is the difference between Beautify and Minify?', a: 'Beautify adds indentation and line breaks to make JSON readable. Minify removes all whitespace to reduce file size — useful for sending JSON over a network.' },
    { q: 'Is my data sent to a server?', a: 'No. All formatting and validation runs entirely in your browser using JavaScript\'s built-in JSON.parse and JSON.stringify. Your data never leaves your device.' },
  ],
};

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [indent, setIndent] = useState(2);
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'JSON Formatter & Validator',
    description: 'Beautify, minify, and validate JSON online. Instant syntax checking and formatting.',
    keywords: ['json formatter', 'json beautify', 'json validator', 'json minify', 'format json online'],
    jsonLd: [buildToolSchema({ name: 'JSON Formatter & Validator', description: 'Beautify, minify and validate JSON online for free', url: '/tools/json-formatter' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/json-formatter',
  });

  const format = useCallback(() => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
      setOutput('');
    }
  }, [input, indent]);

  const minify = useCallback(() => {
    setError('');
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      setError(`Invalid JSON: ${e.message}`);
    }
  }, [input]);

  const validate = useCallback(() => {
    setError('');
    try {
      JSON.parse(input);
      setError('✅ Valid JSON!');
    } catch (e) {
      setError(`❌ Invalid JSON: ${e.message}`);
    }
  }, [input]);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleJSON = `{\n  "name": "Tooli",\n  "version": "1.0.0",\n  "tools": 15,\n  "free": true\n}`;

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Beautify, minify, and validate JSON. Paste your JSON below."
      icon={<JsonFormatterIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-semibold text-gray-900 text-sm">Input JSON</label>
          <button onClick={() => setInput(sampleJSON)} className="text-xs text-blue-600 hover:underline">
            Load sample
          </button>
        </div>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={10}
          className="input resize-none font-mono text-xs"
          placeholder='{"key": "value"}'
          spellCheck={false}
        />

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Indent:</label>
            <select value={indent} onChange={e => setIndent(+e.target.value)} className="input py-1 text-sm w-auto">
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={1}>1 tab</option>
            </select>
          </div>
          <Button onClick={format} size="sm">Beautify</Button>
          <Button onClick={minify} size="sm" variant="secondary">Minify</Button>
          <Button onClick={validate} size="sm" variant="outline">Validate</Button>
        </div>

        {error && (
          <div className={`text-sm font-medium px-3 py-2 rounded-lg ${error.startsWith('✅')
            ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {error}
          </div>
        )}
      </div>

      {output && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-gray-900 text-sm">Output</label>
            <Button size="sm" variant="secondary" onClick={copy}>
              {copied ? '✅ Copied!' : 'Copy'}
            </Button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={12}
            className="input resize-none font-mono text-xs bg-gray-50"
          />
        </div>
      )}
    </ToolLayout>
  );
}
