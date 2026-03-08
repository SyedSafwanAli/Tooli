import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { KeywordDensityIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Keyword Density Checker analyses your content and shows the frequency and density (percentage) of every word. Use it to ensure your target keywords appear at the right density — neither too sparse for SEO nor over-optimised (keyword stuffed). All analysis runs in your browser.',
  howTo: [
    'Paste your article, page content, or any text into the input area.',
    'The word frequency table updates instantly, sorted by count.',
    'Enter a target keyword to jump directly to its density.',
    'Aim for 1–3% density for your primary keyword.',
  ],
  features: [
    'Word frequency count for every word in the text',
    'Keyword density as a percentage of total words',
    'Stop-word filter to hide common words (the, and, is…)',
    'Target keyword highlight and density lookup',
    'Total word count and unique word count',
    '100% client-side — text never leaves your browser',
  ],
  faq: [
    { q: 'What is keyword density?', a: 'Keyword density is the percentage of times a keyword appears in your content relative to the total word count. Formula: (keyword count ÷ total words) × 100.' },
    { q: 'What is the ideal keyword density?', a: 'Most SEO professionals recommend 1–3% for a primary keyword. Above 3–4% may be seen as keyword stuffing by search engines and can hurt rankings.' },
    { q: 'Should I filter stop words?', a: 'Yes, for SEO analysis. Stop words like "the", "and", "is" have no search intent value. Filtering them lets you focus on meaningful keywords.' },
  ],
};

const STOP_WORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by','from',
  'is','are','was','were','be','been','being','have','has','had','do','does','did',
  'will','would','could','should','may','might','shall','can','need','dare','ought',
  'it','its','this','that','these','those','i','you','he','she','we','they','me',
  'him','her','us','them','my','your','his','our','their','what','which','who',
  'whom','whose','when','where','why','how','all','each','every','both','few','more',
  'most','other','some','such','no','nor','not','only','same','so','than','too',
  'very','just','as','if','then','about','after','before','up','out','into','over',
]);

function tokenise(text) {
  return text.toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(w => w.length > 1);
}

function analyse(text, filterStop) {
  if (!text.trim()) return null;
  const words = tokenise(text);
  const totalWords = words.length;
  const filtered = filterStop ? words.filter(w => !STOP_WORDS.has(w)) : words;
  const freq = {};
  filtered.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  const uniqueWords = Object.keys(freq).length;
  return { sorted, totalWords, uniqueWords };
}

export default function KeywordDensity() {
  const [text, setText]           = useState('');
  const [filterStop, setFilterStop] = useState(true);
  const [targetKw, setTargetKw]   = useState('');
  const [showTop, setShowTop]     = useState(20);

  useSEO({
    title: 'Keyword Density Checker',
    description: 'Analyse keyword frequency and density in your content. Find over-optimised or under-used keywords. Free, browser-based keyword density checker.',
    keywords: ['keyword density checker', 'keyword frequency', 'seo content analysis', 'keyword stuffing checker', 'word frequency counter'],
    jsonLd: [
      buildToolSchema({ name: 'Keyword Density Checker', description: 'Analyse keyword frequency and density percentage in any text content', url: '/tools/keyword-density' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/keyword-density',
  });

  const result = useMemo(() => analyse(text, filterStop), [text, filterStop]);

  const targetResult = useMemo(() => {
    if (!targetKw.trim() || !result) return null;
    const kw = targetKw.trim().toLowerCase();
    const entry = result.sorted.find(([w]) => w === kw);
    const count = entry ? entry[1] : 0;
    const density = ((count / result.totalWords) * 100).toFixed(2);
    return { count, density };
  }, [targetKw, result]);

  const densityColor = (count, total) => {
    const d = (count / total) * 100;
    if (d > 4) return 'text-red-500';
    if (d >= 1) return 'text-green-600';
    return 'text-gray-500';
  };

  const topN = result ? result.sorted.slice(0, showTop) : [];

  return (
    <ToolLayout
      title="Keyword Density Checker"
      description="Analyse keyword frequency and density in your content for on-page SEO optimisation."
      icon={<KeywordDensityIcon className="w-6 h-6" />}
      category="SEO"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        {/* Options row */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setFilterStop(v => !v)}
              className={`relative w-9 h-5 rounded-full transition-colors ${filterStop ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${filterStop ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-gray-700">Filter stop words</span>
          </label>
        </div>

        {/* Text input */}
        <div>
          <label className="label">Content to Analyse</label>
          <textarea
            className="input text-sm resize-none"
            rows={7}
            placeholder="Paste your article, blog post, or page content here…"
            value={text}
            onChange={e => setText(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Stats */}
        {result && (
          <div className="flex gap-4 text-sm flex-wrap">
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <div className="font-bold text-gray-800">{result.totalWords.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total Words</div>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <div className="font-bold text-gray-800">{result.uniqueWords.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Unique Words</div>
            </div>
          </div>
        )}

        {/* Target keyword */}
        <div>
          <label className="label">Check Specific Keyword</label>
          <input
            type="text"
            className="input text-sm"
            placeholder="e.g. seo"
            value={targetKw}
            onChange={e => setTargetKw(e.target.value)}
          />
          {targetResult && (
            <div className={`mt-2 text-sm font-semibold ${targetResult.count > 0 ? 'text-green-700' : 'text-gray-400'}`}>
              {targetResult.count > 0
                ? `"${targetKw.trim()}" — ${targetResult.count} occurrences · ${targetResult.density}% density`
                : `"${targetKw.trim()}" not found in text`}
            </div>
          )}
        </div>
      </div>

      {/* Results table */}
      {result && topN.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Top {topN.length} Keywords
            </span>
            <ResultActions copyText={topN.map(([w, c]) => `${w}: ${c} (${((c / result.totalWords) * 100).toFixed(2)}%)`).join('\n')} />
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-8">#</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500">Keyword</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-right">Count</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-right">Density</th>
                  <th className="px-3 py-2 text-xs font-semibold text-gray-500 w-24">Bar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topN.map(([word, count], i) => {
                  const density = (count / result.totalWords) * 100;
                  const barWidth = Math.min(100, (count / topN[0][1]) * 100);
                  return (
                    <tr key={word} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2 text-xs text-gray-300">{i + 1}</td>
                      <td className="px-3 py-2 font-mono text-gray-800">{word}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-600">{count}</td>
                      <td className={`px-3 py-2 text-right tabular-nums font-semibold ${densityColor(count, result.totalWords)}`}>
                        {density.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${barWidth}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {result.sorted.length > showTop && (
            <button
              onClick={() => setShowTop(n => n + 20)}
              className="text-xs text-blue-600 hover:underline w-full text-center py-1"
            >
              Show more ({result.sorted.length - showTop} remaining)
            </button>
          )}
        </div>
      )}

      {!text.trim() && (
        <div className="card">
          <p className="text-xs text-gray-400 text-center py-2">Paste your content above to analyse keyword density.</p>
        </div>
      )}
    </ToolLayout>
  );
}
