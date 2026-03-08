import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { MetaTagGeneratorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Meta Tag Generator creates all the essential HTML meta tags for SEO — including title, description, keywords, robots directives, canonical URL, and author. Fill in the fields and copy the ready-to-paste HTML snippet directly into your page\'s <head>.',
  howTo: [
    'Enter your page title, description, and optional keywords.',
    'Set the robots directive (index/noindex, follow/nofollow).',
    'Optionally add a canonical URL and author name.',
    'Copy the generated HTML and paste it inside your page <head>.',
  ],
  features: [
    'Title tag with character count (optimal 50–60 chars)',
    'Meta description with character count (optimal 150–160 chars)',
    'Meta keywords tag',
    'Robots meta tag (index/noindex, follow/nofollow)',
    'Canonical link tag',
    'Author meta tag',
  ],
  faq: [
    { q: 'How long should a meta title be?', a: 'Google typically displays 50–60 characters. Titles longer than 60 characters may be truncated in search results.' },
    { q: 'How long should a meta description be?', a: 'Aim for 150–160 characters. Descriptions longer than 160 characters are usually cut off in search result snippets.' },
    { q: 'Do meta keywords still matter for SEO?', a: 'Google ignores the meta keywords tag for ranking purposes. However, some other search engines (like Bing) may still use it as a minor signal.' },
  ],
};

const ROBOTS_INDEX  = ['index', 'noindex'];
const ROBOTS_FOLLOW = ['follow', 'nofollow'];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function MetaTagGenerator() {
  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [keywords, setKeywords]   = useState('');
  const [robotsIndex, setRIndex]  = useState('index');
  const [robotsFollow, setRFollow]= useState('follow');
  const [canonical, setCanonical] = useState('');
  const [author, setAuthor]       = useState('');

  useSEO({
    title: 'Meta Tag Generator',
    description: 'Generate HTML meta tags for SEO — title, description, keywords, robots, canonical, author. Copy ready-to-paste code for your page head.',
    keywords: ['meta tag generator', 'seo meta tags', 'html meta tags', 'title tag generator', 'meta description generator'],
    jsonLd: [
      buildToolSchema({ name: 'Meta Tag Generator', description: 'Generate HTML meta tags for SEO', url: '/tools/meta-tag-generator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/meta-tag-generator',
  });

  const output = useMemo(() => {
    const lines = [];
    if (title)       lines.push(`<title>${escapeHtml(title)}</title>`);
    if (description) lines.push(`<meta name="description" content="${escapeHtml(description)}">`);
    if (keywords)    lines.push(`<meta name="keywords" content="${escapeHtml(keywords)}">`);
    lines.push(`<meta name="robots" content="${robotsIndex}, ${robotsFollow}">`);
    if (canonical)   lines.push(`<link rel="canonical" href="${escapeHtml(canonical)}">`);
    if (author)      lines.push(`<meta name="author" content="${escapeHtml(author)}">`);
    return lines.join('\n');
  }, [title, description, keywords, robotsIndex, robotsFollow, canonical, author]);

  const hasContent = title || description;

  const CharCount = ({ value, min, max }) => {
    const len = value.length;
    const color = len === 0 ? 'text-gray-300' : len >= min && len <= max ? 'text-green-500' : len > max ? 'text-red-500' : 'text-amber-500';
    return <span className={`text-xs font-mono ${color}`}>{len}/{max}</span>;
  };

  return (
    <ToolLayout
      title="Meta Tag Generator"
      description="Generate HTML meta tags for SEO instantly. Copy ready-to-paste code for your page <head>."
      icon={<MetaTagGeneratorIcon className="w-6 h-6" />}
      category="SEO"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label">Page Title</label>
            <CharCount value={title} min={50} max={60} />
          </div>
          <input
            type="text"
            className="input"
            placeholder="My Awesome Page Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label">Meta Description</label>
            <CharCount value={description} min={150} max={160} />
          </div>
          <textarea
            className="input resize-none text-sm"
            rows={3}
            placeholder="A concise description of this page for search engines…"
            value={description}
            onChange={e => setDesc(e.target.value)}
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="label">Keywords <span className="text-gray-400 font-normal">(comma-separated)</span></label>
          <input
            type="text"
            className="input text-sm"
            placeholder="seo, meta tags, html"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
          />
        </div>

        {/* Robots */}
        <div>
          <label className="label">Robots</label>
          <div className="flex gap-3">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {ROBOTS_INDEX.map(v => (
                <button key={v} onClick={() => setRIndex(v)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${robotsIndex === v ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                  {v}
                </button>
              ))}
            </div>
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {ROBOTS_FOLLOW.map(v => (
                <button key={v} onClick={() => setRFollow(v)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${robotsFollow === v ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canonical + Author */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Canonical URL <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="url" className="input text-sm" placeholder="https://example.com/page" value={canonical} onChange={e => setCanonical(e.target.value)} />
          </div>
          <div>
            <label className="label">Author <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" className="input text-sm" placeholder="John Doe" value={author} onChange={e => setAuthor(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Output */}
      {hasContent && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Generated HTML</span>
            <ResultActions copyText={output} />
          </div>
          <pre className="bg-gray-900 text-green-400 text-xs font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {output}
          </pre>
        </div>
      )}

      {!hasContent && (
        <div className="card">
          <p className="text-xs text-gray-400 text-center py-2">Fill in the title or description to generate meta tags.</p>
        </div>
      )}
    </ToolLayout>
  );
}
