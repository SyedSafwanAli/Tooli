import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { WordCounterIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Word Counter instantly analyses any text and gives you a full breakdown: word count, character count (with and without spaces), sentence count, paragraph count, line count, average word length, estimated reading time, and your top 5 keywords by frequency.',
  howTo: [
    'Paste or type your text into the text area.',
    'All statistics update instantly as you type — no button press needed.',
    'Scroll down to see top keywords and reading time.',
    'Click "Clear" to reset and start with new text.',
  ],
  features: [
    'Real-time word and character count',
    'Sentence, paragraph, and line counts',
    'Estimated reading time at 200 wpm',
    'Top 5 keyword frequency analysis',
    'Average word length calculation',
    'Runs entirely in your browser — no data sent anywhere',
  ],
  faq: [
    { q: 'Does the word counter work offline?', a: 'Yes. The Word Counter is a purely browser-based tool. Once the page is loaded, it works offline with no internet connection required.' },
    { q: 'How is reading time calculated?', a: 'Reading time is estimated based on an average reading speed of 200 words per minute, rounded up to the nearest minute.' },
    { q: 'What counts as a word?', a: 'Any sequence of non-whitespace characters separated by spaces or line breaks counts as a word. Punctuation attached to a word is included in that word.' },
  ],
};

export default function WordCounter() {
  const [text, setText] = useState('');

  useSEO({
    title: 'Word Counter',
    description: 'Count words, characters, sentences, and paragraphs in your text. Free and instant.',
    keywords: ['word counter', 'character counter', 'word count', 'text analysis', 'reading time calculator'],
    jsonLd: [buildToolSchema({ name: 'Word Counter', description: 'Count words, characters, and sentences in your text', url: '/tools/word-counter' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/word-counter',
  });

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = trimmed ? (trimmed.match(/[.!?]+/g) || []).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).length : 0;
    const lines = text.split('\n').length;
    const avgWordLen = words ? (charsNoSpace / words).toFixed(1) : 0;
    const readTime = Math.ceil(words / 200); // avg 200 wpm

    // Keyword density (top 5 words)
    const freq = {};
    if (trimmed) {
      trimmed.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)
        .filter(w => w.length > 3)
        .forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    }
    const keywords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { words, chars, charsNoSpace, sentences, paragraphs, lines, avgWordLen, readTime, keywords };
  }, [text]);

  const statCards = [
    { label: 'Words', value: stats.words, color: 'text-blue-600' },
    { label: 'Characters', value: stats.chars, color: 'text-purple-600' },
    { label: 'Chars (no spaces)', value: stats.charsNoSpace, color: 'text-green-600' },
    { label: 'Sentences', value: stats.sentences, color: 'text-orange-600' },
    { label: 'Paragraphs', value: stats.paragraphs, color: 'text-red-600' },
    { label: 'Lines', value: stats.lines, color: 'text-gray-600' },
    { label: 'Avg Word Length', value: stats.avgWordLen, color: 'text-blue-600' },
    { label: 'Read Time', value: `~${stats.readTime} min`, color: 'text-green-600' },
  ];

  return (
    <ToolLayout
      title="Word Counter"
      description="Instantly count words, characters, sentences and more."
      icon={<WordCounterIcon className="w-6 h-6" />}
      category="Text"
      seoContent={seoContent}
    >
      <div className="card">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={12}
          className="input resize-none font-mono text-sm"
          placeholder="Paste or type your text here..."
        />
        {text && (
          <div className="flex justify-end mt-2">
            <button onClick={() => setText('')} className="text-xs text-gray-400 hover:text-red-500">Clear</button>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="card text-center py-4">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Top keywords */}
      {stats.keywords.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Top Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {stats.keywords.map(([word, count]) => (
              <span key={word} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                {word} <span className="opacity-60">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
