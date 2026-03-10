import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ToolCard from '../components/common/ToolCard';
import { TOOLS, CATEGORIES } from '../constants/tools';
import { useSEO } from '../utils/useSEO';
import { trackPageView } from '../services/toolsApi';

const CAT_ICONS = {
  Images: '🖼', PDF: '📄', Text: '📝', Developer: '⚡',
  Security: '🔒', SEO: '🔍', Calculator: '🧮', Utility: '🔧',
};

const CAT_COLORS = {
  Images:    'bg-blue-50   text-blue-700   border-blue-200',
  PDF:       'bg-red-50    text-red-700    border-red-200',
  Text:      'bg-green-50  text-green-700  border-green-200',
  Developer: 'bg-purple-50 text-purple-700 border-purple-200',
  Security:  'bg-amber-50  text-amber-700  border-amber-200',
  SEO:       'bg-teal-50   text-teal-700   border-teal-200',
  Calculator:'bg-orange-50 text-orange-700 border-orange-200',
  Utility:   'bg-slate-50  text-slate-700  border-slate-200',
};

const QUICK_LINKS = [
  'Image Compressor', 'PDF Merger', 'JSON Formatter',
  'Password Generator', 'QR Code Generator', 'Markdown ↔ PDF Converter',
];

const BENEFITS = [
  { icon: '⚡', title: 'Lightning Fast', desc: 'Most tools run entirely in your browser — zero upload wait.' },
  { icon: '🔒', title: '100% Private',   desc: 'Frontend tools never send your data to any server.' },
  { icon: '🎯', title: 'Zero Signup',    desc: 'No account, no email, no credit card. Just open and use.' },
  { icon: '∞',  title: 'Always Free',   desc: 'All 61 tools are completely free with no daily limits.' },
];

const FEATURE_ROWS = [
  {
    icon: '🖼', heading: 'Image Tools',
    items: ['Compress without quality loss', 'Resize to exact dimensions', 'Convert JPG · PNG · WebP · AVIF', 'Crop with aspect ratio lock', 'Batch convert up to 50 files'],
  },
  {
    icon: '📄', heading: 'PDF Tools',
    items: ['Merge up to 10 PDFs into one', 'Split PDF by page range', 'Convert images to PDF', 'Extract PDF text as Markdown', 'View PDF metadata & page count'],
  },
  {
    icon: '⚡', heading: 'Developer Tools',
    items: ['Format & validate JSON', 'Encode/decode Base64 & URLs', 'JWT decoder, UUID generator', 'Regex tester with live highlighting', 'Binary, Hex, Roman numerals'],
  },
  {
    icon: '🔍', heading: 'SEO & Security',
    items: ['Generate meta & Open Graph tags', 'Build robots.txt & XML sitemap', 'Keyword density checker', 'Cryptographically secure passwords', 'SHA-256/512 hash generator'],
  },
];

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch]     = useState('');
  const activeCategory = searchParams.get('category') || 'All';

  useSEO({
    title: 'Free Online Tools',
    description: '61 free online tools for images, PDFs, text, SEO, security, and developers. No signup, no watermarks, no limits.',
    keywords: ['free online tools', 'image compressor', 'pdf merger', 'json formatter', 'password generator', 'markdown to pdf'],
  });

  useEffect(() => { trackPageView('/'); }, []);

  const filtered = TOOLS.filter(t => {
    const matchCat    = activeCategory === 'All' || t.category === activeCategory;
    const q           = search.toLowerCase();
    const matchSearch = !search
      || t.title.toLowerCase().includes(q)
      || t.description.toLowerCase().includes(q)
      || t.keywords.some(k => k.includes(q));
    return matchCat && matchSearch;
  });

  function setCategory(cat) {
    if (cat === 'All') setSearchParams({});
    else setSearchParams({ category: cat });
    setSearch('');
  }

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-[#2563EB] text-white">
        {/* dot-grid pattern */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6 border border-white/20"
          >
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            61 free tools · no signup required
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5"
          >
            Free Online Tools<br />
            <span className="text-blue-200">For Everyone</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Images, PDFs, Markdown, JSON, passwords, QR codes and more.
            Fast, private, completely free — no account needed.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="relative max-w-xl mx-auto mb-8"
          >
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="search"
              placeholder="Search 61 tools…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-gray-900 text-base font-medium shadow-xl outline-none focus:ring-2 focus:ring-blue-300 placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm px-2">✕</button>
            )}
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-2 text-sm"
          >
            {QUICK_LINKS.map(name => {
              const tool = TOOLS.find(t => t.title === name);
              return tool ? (
                <Link key={name} to={tool.path}
                  className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-colors text-white/90 hover:text-white text-xs font-medium">
                  {tool.icon} {name}
                </Link>
              ) : null;
            })}
          </motion.div>
        </div>
      </div>

      {/* ─── Stats bar ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x divide-gray-700">
            {[
              { n: '61',   label: 'Free Tools' },
              { n: '8',    label: 'Categories' },
              { n: '0',    label: 'Signup Required' },
              { n: '100%', label: 'Private' },
            ].map(({ n, label }) => (
              <div key={label} className="px-4">
                <div className="text-2xl font-extrabold text-blue-400">{n}</div>
                <div className="text-xs text-gray-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* ─── Category tabs ─────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {['All', ...CATEGORIES].map(cat => {
            const count = cat === 'All' ? TOOLS.length : TOOLS.filter(t => t.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border
                  ${activeCategory === cat
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                  }`}
              >
                {cat !== 'All' && <span className="text-sm">{CAT_ICONS[cat]}</span>}
                {cat}
                <span className={`text-xs font-semibold tabular-nums ${activeCategory === cat ? 'text-blue-200' : 'text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ─── Tool grid ─────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-5xl mb-4">🔎</div>
            <p className="text-lg font-semibold text-gray-600">No tools found for "{search}"</p>
            <p className="text-sm mt-1 mb-4">Try a different keyword</p>
            <button onClick={() => setSearch('')} className="text-blue-600 hover:underline text-sm font-medium">Clear search</button>
          </div>
        ) : (
          <>
            {search && (
              <p className="text-sm text-gray-500 mb-4 text-center">
                <strong>{filtered.length}</strong> tool{filtered.length !== 1 ? 's' : ''} found for "{search}"
              </p>
            )}
            <motion.div
              key={activeCategory + search}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filtered.map(tool => <ToolCard key={tool.id} tool={tool} />)}
            </motion.div>
          </>
        )}

        {/* ─── Category showcase (only on All view, no search) ───────────── */}
        {activeCategory === 'All' && !search && (
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CATEGORIES.map(cat => {
              const count = TOOLS.filter(t => t.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all hover:shadow-md ${CAT_COLORS[cat]}`}
                >
                  <span className="text-3xl">{CAT_ICONS[cat]}</span>
                  <div>
                    <p className="font-bold text-sm">{cat}</p>
                    <p className="text-xs opacity-70">{count} tools</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ─── Benefits ─────────────────────────────────────────────────── */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BENEFITS.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm text-center hover:shadow-md transition-shadow">
              <div className="text-3xl font-bold text-blue-600 mb-2">{icon}</div>
              <h3 className="font-bold text-gray-900 mb-1 text-sm">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* ─── Feature rows ─────────────────────────────────────────────── */}
        <div className="mt-16 pt-10 border-t border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Everything you need, all in one place</h2>
          <p className="text-gray-500 text-sm text-center mb-10">61 tools across 8 categories — all free, all fast, all private.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURE_ROWS.map(({ icon, heading, items }) => (
              <div key={heading} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="font-bold text-gray-800 text-sm">{heading}</h3>
                </div>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
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
