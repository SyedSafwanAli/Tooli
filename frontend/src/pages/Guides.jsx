import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GUIDES_SORTED } from '../constants/guides';
import { useSEO } from '../utils/useSEO';
import api from '../services/api';

const CATEGORY_COLORS = {
  Images:     'bg-blue-50 text-blue-600 border-blue-100',
  PDF:        'bg-red-50 text-red-600 border-red-100',
  Text:       'bg-green-50 text-green-600 border-green-100',
  Developer:  'bg-purple-50 text-purple-600 border-purple-100',
  Security:   'bg-amber-50 text-amber-600 border-amber-100',
  SEO:        'bg-teal-50 text-teal-600 border-teal-100',
  Calculator: 'bg-orange-50 text-orange-600 border-orange-100',
  Utility:    'bg-slate-50 text-slate-600 border-slate-100',
};

export default function Guides() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [apiGuides, setApiGuides] = useState([]);

  useEffect(() => {
    api.get('/guides-api')
      .then(r => setApiGuides(r.data.data || []))
      .catch(() => {});
  }, []);

  useSEO({
    title: 'Tool Guides',
    description: 'Step-by-step guides for every Tooli tool. Learn image compression, JSON formatting, regex, password security, and more.',
    keywords: ['tool guides', 'how to compress images', 'json tutorial', 'regex guide', 'password security'],
    canonical: '/guides',
  });

  // Merge: published API guides first, then static guides (deduplicated by slug)
  const apiSlugs = new Set(apiGuides.map(g => g.slug));
  const allGuides = [
    ...apiGuides.map(g => ({ ...g, description: g.metaDescription || '', _api: true })),
    ...GUIDES_SORTED.filter(g => !apiSlugs.has(g.slug)),
  ];

  const ALL_CATEGORIES = [...new Set(allGuides.map(g => g.category))];

  const filtered = activeCategory === 'All'
    ? allGuides
    : allGuides.filter(g => g.category === activeCategory);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">

      {/* Header */}
      <div className="mb-10">
        <nav className="text-sm text-gray-400 mb-4 flex items-center gap-1">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span className="text-gray-300">›</span>
          <span className="text-gray-600">Guides</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Tool Guides</h1>
        <p className="text-gray-500 text-lg max-w-2xl">
          Step-by-step tutorials for every tool — from image compression to regex patterns.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-8">
        {['All', ...ALL_CATEGORIES].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              activeCategory === cat
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {cat}
            {cat !== 'All' && (
              <span className="ml-1.5 opacity-60">{allGuides.filter(g => g.category === cat).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Guide cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(guide => {
          const colorClass = CATEGORY_COLORS[guide.category] || CATEGORY_COLORS.Utility;
          return (
            <Link
              key={guide.id || guide.slug}
              to={`/guides/${guide.slug}`}
              className="group flex flex-col bg-white border border-gray-100 rounded-2xl p-5 hover:border-blue-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClass}`}>
                  {guide.category}
                </span>
                <span className="text-xs text-gray-400">{guide.readTime} min read</span>
              </div>
              <h2 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 leading-snug">
                {guide.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed flex-1 mb-4">{guide.description}</p>
              <div className="flex items-center gap-1.5 text-blue-600 text-sm font-semibold">
                Read guide
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No guides in this category yet.</p>
          <button onClick={() => setActiveCategory('All')} className="mt-3 text-blue-600 hover:underline">
            View all guides
          </button>
        </div>
      )}
    </div>
  );
}
