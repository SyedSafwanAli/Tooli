import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TextCaseConverterIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Text Case Converter transforms any text into nine different capitalisation styles. Whether you need UPPERCASE for headers, camelCase for JavaScript variables, snake_case for Python, or kebab-case for CSS and URLs, this tool handles every conversion instantly in your browser without uploading anything.',
  howTo: [
    'Type or paste your text into the input box.',
    'All nine conversions appear simultaneously below.',
    'Click "Copy" next to any format to copy it to your clipboard.',
    'Switch between formats freely — your input is preserved.',
  ],
  features: [
    'UPPERCASE and lowercase',
    'Title Case (every word capitalised)',
    'Sentence case (first word only)',
    'camelCase for JavaScript/Java variables',
    'PascalCase for class names and React components',
    'snake_case for Python, Ruby, and databases',
    'kebab-case for CSS properties and URL slugs',
    'CONSTANT_CASE for environment variables',
    'dot.case for configuration keys',
  ],
  faq: [
    { q: 'What is camelCase?', a: 'camelCase joins words without spaces, capitalising the first letter of each word except the first: myVariableName. It is standard for variables and functions in JavaScript, TypeScript, Java, and Swift.' },
    { q: 'When should I use snake_case?', a: 'snake_case uses underscores between words with all lowercase letters. It is the convention for Python variables, Ruby methods, PostgreSQL column names, and REST API query parameters.' },
    { q: 'What is the difference between PascalCase and camelCase?', a: 'Both join words without separators but PascalCase capitalises the first letter of every word including the first (MyComponent), while camelCase keeps it lowercase (myVariable). PascalCase is used for class names, TypeScript types, and React components.' },
    { q: 'What is kebab-case used for?', a: 'kebab-case uses hyphens to separate words and is all lowercase. It is the standard for CSS property names (background-color), HTML attributes (data-value), URL slugs, and npm package names.' },
  ],
};

const CASES = [
  { id: 'upper',    label: 'UPPERCASE',     fn: t => t.toUpperCase() },
  { id: 'lower',    label: 'lowercase',     fn: t => t.toLowerCase() },
  { id: 'title',    label: 'Title Case',    fn: t => t.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase()) },
  { id: 'sentence', label: 'Sentence case', fn: t => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() },
  { id: 'camel',    label: 'camelCase',     fn: t => t.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, c => c.toLowerCase()) },
  { id: 'pascal',   label: 'PascalCase',    fn: t => t.replace(/(^|[^a-zA-Z0-9]+)([a-zA-Z])/g, (_, __, c) => c.toUpperCase()) },
  { id: 'snake',    label: 'snake_case',    fn: t => t.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') },
  { id: 'kebab',    label: 'kebab-case',    fn: t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
  { id: 'constant', label: 'CONSTANT_CASE', fn: t => t.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '') },
  { id: 'dot',      label: 'dot.case',      fn: t => t.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') },
];

export default function TextCaseConverter() {
  const [text, setText] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  useSEO({
    title: 'Text Case Converter',
    description: 'Convert text to UPPERCASE, lowercase, camelCase, PascalCase, snake_case, kebab-case, and more. Instant, free, browser-based.',
    keywords: ['text case converter', 'uppercase converter', 'camelcase', 'snake_case', 'kebab-case', 'pascal case', 'title case'],
    jsonLd: [
      buildToolSchema({ name: 'Text Case Converter', description: 'Convert text between different capitalisation styles', url: '/tools/text-case-converter' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/text-case-converter',
  });

  const copy = async (id, value) => {
    await navigator.clipboard.writeText(value);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <ToolLayout
      title="Text Case Converter"
      description="Convert text to UPPERCASE, camelCase, snake_case, kebab-case, and 6 more styles — instantly."
      icon={<TextCaseConverterIcon className="w-6 h-6" />}
      category="Text"
      seoContent={seoContent}
    >
      <div className="card">
        <label className="label">Input Text</label>
        <textarea
          className="input resize-none"
          rows={4}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste your text here…"
          autoFocus
        />
        {text && (
          <div className="flex justify-end mt-2">
            <button onClick={() => setText('')} className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              Clear
            </button>
          </div>
        )}
      </div>

      {text ? (
        <div className="space-y-2">
          {CASES.map(({ id, label, fn }) => {
            const converted = fn(text);
            return (
              <div key={id} className="card flex items-center gap-3 py-3">
                <span className="text-xs font-semibold text-gray-400 w-32 shrink-0 font-mono">{label}</span>
                <span className="flex-1 text-sm text-gray-800 font-mono break-all">{converted}</span>
                <button
                  onClick={() => copy(id, converted)}
                  className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
                >
                  {copiedId === id ? '✓' : 'Copy'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card text-center py-8 text-gray-400 text-sm">
          Enter text above to see all 10 case conversions.
        </div>
      )}
    </ToolLayout>
  );
}
