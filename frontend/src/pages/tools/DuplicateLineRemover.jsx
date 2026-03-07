import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { DuplicateLineRemoverIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Duplicate Line Remover strips repeated lines from any list of text. Paste your data, choose whether comparison is case-sensitive, whether to sort the output, and whether to trim whitespace — and get a clean, deduplicated list in one click.',
  howTo: [
    'Paste your text or list into the input field.',
    'Choose your options: case-sensitive comparison, sort output, trim whitespace.',
    'The deduplicated result appears automatically.',
    'Click "Copy" to copy the result or "Download" to save as a .txt file.',
  ],
  features: [
    'Removes duplicate lines keeping the first occurrence',
    'Case-sensitive or case-insensitive comparison',
    'Optional output sorting (alphabetical)',
    'Optional whitespace trimming per line',
    'Shows count of removed duplicates',
    'Copy result or download as .txt',
    'Runs entirely in the browser',
  ],
  faq: [
    { q: 'Does it remove blank lines?', a: 'By default blank lines are kept if they are unique. Enable the "Trim whitespace" option to treat all whitespace-only lines the same as blank lines, effectively removing extra blank lines.' },
    { q: 'Which occurrence is kept when a duplicate is found?', a: 'The first occurrence is always kept. All subsequent duplicate lines are removed.' },
    { q: 'Does the tool work with very large lists?', a: 'Yes. The algorithm uses a Set for O(n) deduplication and handles hundreds of thousands of lines efficiently in the browser.' },
  ],
};

export default function DuplicateLineRemover() {
  const [input, setInput] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [sortOutput, setSortOutput] = useState(false);
  const [trimLines, setTrimLines] = useState(false);
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'Duplicate Line Remover',
    description: 'Remove duplicate lines from any list instantly. Case-sensitive or insensitive comparison, sort output, trim whitespace. Free browser tool.',
    keywords: ['duplicate line remover', 'remove duplicate lines', 'deduplicate text', 'unique lines', 'text cleaner'],
    jsonLd: [
      buildToolSchema({ name: 'Duplicate Line Remover', description: 'Remove duplicate lines from text', url: '/tools/duplicate-line-remover' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/duplicate-line-remover',
  });

  const { output, removedCount, totalIn } = useMemo(() => {
    if (!input) return { output: '', removedCount: 0, totalIn: 0 };

    const lines = input.split('\n');
    const seen = new Set();
    const unique = [];

    for (const raw of lines) {
      const line = trimLines ? raw.trim() : raw;
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(line);
      }
    }

    const sorted = sortOutput ? [...unique].sort((a, b) => a.localeCompare(b)) : unique;

    return {
      output: sorted.join('\n'),
      removedCount: lines.length - unique.length,
      totalIn: lines.length,
    };
  }, [input, caseSensitive, sortOutput, trimLines]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deduplicated.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-2.5 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );

  return (
    <ToolLayout
      title="Duplicate Line Remover"
      description="Remove duplicate lines from any list. Supports case-insensitive comparison, sorting, and whitespace trimming."
      icon={<DuplicateLineRemoverIcon className="w-6 h-6" />}
      category="Text"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        {/* Options */}
        <div className="flex flex-wrap gap-4">
          <Toggle checked={caseSensitive} onChange={setCaseSensitive} label="Case sensitive" />
          <Toggle checked={sortOutput}    onChange={setSortOutput}    label="Sort output" />
          <Toggle checked={trimLines}     onChange={setTrimLines}     label="Trim whitespace" />
        </div>

        <div>
          <label className="label">Input Text</label>
          <textarea
            className="input resize-none font-mono text-sm"
            rows={9}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste your list here — one item per line…"
          />
        </div>
      </div>

      {input && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900 text-sm">Result</h3>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${removedCount > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {removedCount > 0 ? `${removedCount} duplicate${removedCount !== 1 ? 's' : ''} removed` : 'No duplicates found'}
              </span>
              <span className="text-xs text-gray-400">{totalIn - removedCount} unique lines</span>
            </div>
            <ResultActions
              onDownload={handleDownload}
              downloadLabel="Download .txt"
              copyText={output}
            />
          </div>
          <textarea
            readOnly
            className="input resize-none font-mono text-sm bg-gray-50"
            rows={9}
            value={output}
          />
        </div>
      )}

      {!input && (
        <p className="text-xs text-gray-400 text-center py-2">Paste your list above to remove duplicates.</p>
      )}
    </ToolLayout>
  );
}
