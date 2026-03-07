import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ToolCard from '../components/common/ToolCard';
import { TOOLS, CATEGORIES } from '../constants/tools';
import { useSEO } from '../utils/useSEO';
import { trackPageView } from '../services/toolsApi';

const CATEGORY_ICONS = {
  Images: '🖼',
  PDF: '📄',
  Text: '📝',
  Developer: '⚡',
  Security: '🔒',
  Utility: '🔧',
};

const BENEFITS = [
  { icon: '⚡', title: 'Lightning Fast', desc: 'Most tools run entirely in your browser — no upload wait time.' },
  { icon: '🔒', title: '100% Private', desc: 'Frontend tools never send your data to any server.' },
  { icon: '0', title: 'Zero Signup', desc: 'No account, no email, no credit card. Just open and use.' },
  { icon: '∞', title: 'Always Free', desc: 'All 15 tools are free to use with no daily limits or watermarks.' },
];

const SEO_PARAGRAPHS = [
  'Tooli is a collection of 15 free online tools designed for developers, designers, students, and everyday users. Whether you need to compress an image before uploading it to a website, merge PDF documents for a report, or quickly format a JSON response from an API, Tooli has you covered — with no signup and no watermarks.',
  'Six of our tools are server-powered (Image Compressor, Image Resizer, Image Converter, PDF Merger, PDF Splitter, and Image to PDF), meaning they use a high-performance Node.js backend powered by Sharp and pdf-lib for professional-grade results. The remaining nine tools run entirely in your browser using JavaScript — your data never leaves your device.',
  'Privacy is a core principle at Tooli. Browser-based tools like the Password Generator (using Web Crypto API), Hash Generator (SHA-256/512 via SubtleCrypto), and Base64 Encoder/Decoder operate completely offline after the page loads. Your sensitive text, passwords, and files are never sent anywhere.',
  'All tools are optimised for speed, mobile responsiveness, and accessibility. They work on any modern browser without plugins or downloads. Bookmark Tooli and save yourself from hunting for sketchy online converters every time you need one.',
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const activeCategory = searchParams.get('category') || 'All';

  useSEO({
    title: 'Free Online Tools',
    description: '15 free online tools for images, PDFs, text, and developer utilities. No signup, no watermarks, no limits.',
    keywords: ['free online tools', 'image compressor', 'pdf merger', 'json formatter', 'password generator', 'base64 encoder'],
  });

  useEffect(() => {
    trackPageView('/');
  }, []);

  const filtered = TOOLS.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.keywords.some(k => k.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const setCategory = (cat) => {
    if (cat === 'All') setSearchParams({});
    else setSearchParams({ category: cat });
    setSearch('');
  };

  return (
    <div>
      {/* ─── Hero ─── */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/20">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            15 free tools — no signup required
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-5">
            Free Online Tools<br />
            <span className="text-blue-200">For Everyone</span>
          </h1>

          <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-8 leading-relaxed">
            Compress images, merge PDFs, format JSON, generate passwords and more.
            Fast, private, and completely free — no account needed.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto mb-8">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="search"
              placeholder="Search 15 tools..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-900 text-base font-medium shadow-lg outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400"
            />
          </div>

          {/* CTA quick links */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            {['Image Compressor', 'PDF Merger', 'JSON Formatter', 'Password Generator', 'QR Code Generator'].map(name => {
              const tool = TOOLS.find(t => t.title === name);
              return tool ? (
                <Link
                  key={name}
                  to={tool.path}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors backdrop-blur-sm"
                >
                  {name}
                </Link>
              ) : null;
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* ─── Category tabs ─── */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              {cat !== 'All' && <span>{CATEGORY_ICONS[cat]}</span>}
              {cat}
              {cat !== 'All' && (
                <span className={`text-xs ${activeCategory === cat ? 'text-blue-200' : 'text-gray-400'}`}>
                  {TOOLS.filter(t => t.category === cat).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Tool grid ─── */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔎</div>
            <p className="text-lg font-medium text-gray-600">No tools found for "{search}"</p>
            <p className="text-sm mt-1">Try a different keyword</p>
            <button onClick={() => setSearch('')} className="mt-4 text-blue-600 hover:underline text-sm font-medium">
              Clear search
            </button>
          </div>
        ) : (
          <>
            {search && (
              <p className="text-sm text-gray-500 mb-4 text-center">
                {filtered.length} tool{filtered.length !== 1 ? 's' : ''} found for "{search}"
              </p>
            )}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(tool => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </>
        )}

        {/* ─── Benefits ─── */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENEFITS.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{icon}</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ─── Stats bar ─── */}
        <div className="mt-8 grid grid-cols-3 gap-6 text-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl py-8">
          {[
            { n: '15', label: 'Free tools' },
            { n: '0', label: 'Signup required' },
            { n: '100%', label: 'Browser privacy' },
          ].map(({ n, label }) => (
            <div key={label}>
              <div className="text-3xl font-extrabold text-blue-600">{n}</div>
              <div className="text-sm text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* ─── SEO Content ─── */}
        <div className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About Tooli — Free Online Tools</h2>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed max-w-3xl">
            {SEO_PARAGRAPHS.map((p, i) => <p key={i}>{p}</p>)}
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {[
              { heading: 'Image Tools', items: ['Compress images without quality loss', 'Resize to exact dimensions', 'Convert JPG, PNG, WebP, AVIF'] },
              { heading: 'PDF Tools', items: ['Merge multiple PDFs into one', 'Split PDF by page range', 'Convert images to PDF'] },
              { heading: 'Developer Tools', items: ['Format & validate JSON', 'Encode/decode Base64 and URLs', 'Generate SHA-256/512 hashes', 'Convert HEX, RGB, HSL colors'] },
            ].map(({ heading, items }) => (
              <div key={heading}>
                <h3 className="font-bold text-gray-800 mb-3 text-sm">{heading}</h3>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-green-500 font-bold mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
