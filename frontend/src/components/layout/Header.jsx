import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CATEGORIES, TOOLS } from '../../constants/tools';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = searchQuery.length > 1
    ? TOOLS.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.keywords.some(k => k.includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 shrink-0">
          <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">T</span>
          Tooli
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="search"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onBlur={() => setTimeout(() => setSearchQuery(''), 200)}
            className="input pl-9 py-1.5 text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>

          {filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
              {filtered.map(t => (
                <Link
                  key={t.id}
                  to={t.path}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm"
                >
                  <span>{t.icon}</span>
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-gray-500">{t.category}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-auto">
          {CATEGORIES.map(cat => (
            <Link
              key={cat}
              to={`/?category=${cat}`}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {cat}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          {TOOLS.map(t => (
            <Link
              key={t.id}
              to={t.path}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm"
            >
              <span>{t.icon}</span>
              {t.title}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
