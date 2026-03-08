import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { TextDiffIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Text Diff Checker compares two blocks of text line by line and highlights exactly what was added, removed, or unchanged. Useful for spotting changes between document versions, code snippets, or any two pieces of text.',
  howTo: [
    'Paste the original text into the left panel.',
    'Paste the modified text into the right panel.',
    'The diff result appears instantly below — green for additions, red for deletions.',
    'Use the stats bar to see how many lines were added, removed, or unchanged.',
  ],
  features: [
    'Line-by-line diff with Myers algorithm',
    'Green highlights for added lines, red for removed',
    'Unchanged lines shown in context',
    'Stats: added / removed / unchanged line counts',
    'Ignore whitespace option',
    '100% client-side — text never leaves your browser',
  ],
  faq: [
    { q: 'Does this do character-level or line-level diff?', a: 'The tool compares line by line. Each line is classified as added, removed, or unchanged.' },
    { q: 'What does "ignore whitespace" do?', a: 'When enabled, lines that differ only in leading/trailing whitespace are treated as identical.' },
    { q: 'Can I compare code snippets?', a: 'Yes. The diff works on any text. For code, use a monospace font and ensure both snippets use consistent indentation.' },
  ],
};

// Simple LCS-based diff
function diff(aLines, bLines) {
  const m = aLines.length;
  const n = bLines.length;

  // Build LCS table
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (aLines[i - 1] === bLines[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  // Backtrack
  const result = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && aLines[i - 1] === bLines[j - 1]) {
      result.unshift({ type: 'same', text: aLines[i - 1] });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      result.unshift({ type: 'added', text: bLines[j - 1] });
      j--;
    } else {
      result.unshift({ type: 'removed', text: aLines[i - 1] });
      i--;
    }
  }
  return result;
}

const SAMPLE_A = `The quick brown fox
jumps over the lazy dog
Pack my box with five
dozen liquor jugs`;

const SAMPLE_B = `The quick brown fox
jumps over the lazy cat
Pack my box with six
dozen liquor jugs
Have a great day`;

export default function TextDiff() {
  const [textA, setTextA]           = useState('');
  const [textB, setTextB]           = useState('');
  const [ignoreWs, setIgnoreWs]     = useState(false);

  useSEO({
    title: 'Text Diff Checker',
    description: 'Compare two texts and highlight differences line by line. Free, instant, browser-based text diff tool.',
    keywords: ['text diff', 'compare text', 'text comparison', 'diff checker', 'find differences in text'],
    jsonLd: [
      buildToolSchema({ name: 'Text Diff Checker', description: 'Compare two texts and highlight differences line by line', url: '/tools/text-diff' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/text-diff',
  });

  const result = useMemo(() => {
    if (!textA.trim() && !textB.trim()) return null;
    const norm = (s) => ignoreWs ? s.trim() : s;
    const aLines = textA.split('\n').map(norm);
    const bLines = textB.split('\n').map(norm);
    return diff(aLines, bLines);
  }, [textA, textB, ignoreWs]);

  const added    = result?.filter(l => l.type === 'added').length ?? 0;
  const removed  = result?.filter(l => l.type === 'removed').length ?? 0;
  const same     = result?.filter(l => l.type === 'same').length ?? 0;
  const hasChanges = added > 0 || removed > 0;

  const loadSample = () => { setTextA(SAMPLE_A); setTextB(SAMPLE_B); };

  return (
    <ToolLayout
      title="Text Diff Checker"
      description="Compare two blocks of text and instantly see every added, removed, and unchanged line."
      icon={<TextDiffIcon className="w-6 h-6" />}
      category="Text"
      seoContent={seoContent}
    >
      {/* Options */}
      <div className="card py-3">
        <div className="flex items-center gap-4 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setIgnoreWs(v => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${ignoreWs ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${ignoreWs ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-gray-700">Ignore leading/trailing whitespace</span>
          </label>
          <button onClick={loadSample} className="text-xs text-blue-600 hover:underline ml-auto">Load sample</button>
        </div>
      </div>

      {/* Side-by-side inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card space-y-2">
          <label className="label">Original Text</label>
          <textarea
            className="input text-sm font-mono resize-none"
            rows={8}
            placeholder="Paste original text here…"
            value={textA}
            onChange={e => setTextA(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="card space-y-2">
          <label className="label">Modified Text</label>
          <textarea
            className="input text-sm font-mono resize-none"
            rows={8}
            placeholder="Paste modified text here…"
            value={textB}
            onChange={e => setTextB(e.target.value)}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="card space-y-3">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-green-600 font-semibold">+{added} added</span>
            <span className="text-red-500 font-semibold">−{removed} removed</span>
            <span className="text-gray-400">{same} unchanged</span>
            {!hasChanges && <span className="text-blue-600 font-semibold ml-auto">✓ Texts are identical</span>}
          </div>

          {/* Diff lines */}
          {hasChanges && (
            <div className="rounded-xl border border-gray-100 overflow-hidden text-xs font-mono">
              {result.map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-2 px-3 py-1 leading-relaxed ${
                    line.type === 'added'   ? 'bg-green-50 text-green-800' :
                    line.type === 'removed' ? 'bg-red-50 text-red-700' :
                    'text-gray-600'
                  }`}
                >
                  <span className={`shrink-0 w-4 select-none ${
                    line.type === 'added'   ? 'text-green-400' :
                    line.type === 'removed' ? 'text-red-400' :
                    'text-gray-300'
                  }`}>
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '−' : ' '}
                  </span>
                  <span className="whitespace-pre-wrap break-all">{line.text || ' '}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!result && (
        <div className="card">
          <p className="text-xs text-gray-400 text-center py-2">Paste text in both panels to see the diff.</p>
        </div>
      )}
    </ToolLayout>
  );
}
