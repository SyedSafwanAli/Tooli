import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES, TOOLS } from '../../constants/tools';

const CAT_ICONS = {
  Images: '🖼', PDF: '📄', Text: '📝', Developer: '⚡',
  Security: '🔒', SEO: '🔍', Calculator: '🧮', Utility: '🔧',
};

export default function Header() {
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch,  setShowSearch]  = useState(false);
  const searchRef  = useRef(null);
  const location   = useLocation();

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); setSearchQuery(''); }, [location.pathname]);

  // Close search dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
        setSearchQuery('');
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const results = searchQuery.length > 1
    ? TOOLS.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.keywords.some(k => k.includes(searchQuery.toLowerCase()))
      ).slice(0, 8)
    : [];

  // Group tools by category for mobile menu
  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = TOOLS.filter(t => t.category === cat);
    return acc;
  }, {});

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white font-black text-sm tracking-tight">T</span>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">
              Tool<span className="text-blue-600">i</span>
            </span>
          </Link>

          {/* ── Search ── */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="search"
                placeholder="Search 61 tools…"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 focus:bg-white transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Search results dropdown */}
            {showSearch && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
                {results.map(t => (
                  <Link
                    key={t.id}
                    to={t.path}
                    onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors group"
                  >
                    <span className="text-lg w-7 text-center">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700">{t.title}</p>
                      <p className="text-xs text-gray-400 truncate">{t.description}</p>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">{t.category}</span>
                  </Link>
                ))}
              </div>
            )}

            {showSearch && searchQuery.length > 1 && results.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 px-4 py-5 text-center text-sm text-gray-400">
                No tools found for "{searchQuery}"
              </div>
            )}
          </div>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center gap-1 ml-auto">
            {CATEGORIES.map(cat => (
              <Link
                key={cat}
                to={`/?category=${cat}`}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span className="text-sm">{CAT_ICONS[cat]}</span>
                {cat}
              </Link>
            ))}
            <span className="w-px h-5 bg-gray-200 mx-1" />
            <Link to="/guides" className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Guides
            </Link>
            <Link to="/blog" className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Blog
            </Link>
          </nav>

          {/* ── Mobile menu button ── */}
          <button
            className="lg:hidden ml-auto p-2 rounded-xl hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen
              ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
            }
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-4">
            <div className="flex gap-2 mb-4">
              <Link to="/guides" onClick={() => setMenuOpen(false)}
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold"
              >
                📖 Guides
              </Link>
              <Link to="/blog" onClick={() => setMenuOpen(false)}
                className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold"
              >
                ✍️ Blog
              </Link>
            </div>

            <div className="space-y-5">
              {CATEGORIES.map(cat => (
                <div key={cat}>
                  <Link
                    to={`/?category=${cat}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 hover:text-blue-600"
                  >
                    <span>{CAT_ICONS[cat]}</span> {cat}
                  </Link>
                  <div className="grid grid-cols-2 gap-1">
                    {byCategory[cat]?.map(t => (
                      <Link
                        key={t.id}
                        to={t.path}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50 text-xs text-gray-700 hover:text-blue-600 transition-colors"
                      >
                        <span className="text-sm shrink-0">{t.icon}</span>
                        <span className="truncate font-medium">{t.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
