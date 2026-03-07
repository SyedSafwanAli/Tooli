import { Link, useLocation } from 'react-router-dom';
import { TOOLS } from '../constants/tools';
import { ICON_MAP } from '../components/common/Icons';

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

/**
 * Shown for tools that exist in TOOLS but don't yet have a built page.
 * Automatically picks up the correct title, description and category
 * from the TOOLS constant — no per-tool configuration required.
 */
export default function ComingSoon() {
  const location = useLocation();
  const tool = TOOLS.find(t => t.path === location.pathname);

  if (!tool) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tool Not Found</h1>
        <p className="text-gray-500 mb-6">We couldn't find a tool at this URL.</p>
        <Link to="/" className="text-blue-600 hover:underline font-medium">← Browse all tools</Link>
      </div>
    );
  }

  const IconComponent = ICON_MAP[tool.id];
  const iconClass = CATEGORY_COLORS[tool.category] || CATEGORY_COLORS.Utility;

  // Related tools: same category (excluding this one), up to 4
  const related = TOOLS
    .filter(t => t.category === tool.category && t.id !== tool.id)
    .slice(0, 4);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 animate-fade-in">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8 flex items-center gap-1">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span className="text-gray-300">›</span>
        <Link to={`/?category=${tool.category}`} className="hover:text-blue-600 transition-colors">
          {tool.category}
        </Link>
        <span className="text-gray-300">›</span>
        <span className="text-gray-600">{tool.title}</span>
      </nav>

      {/* Hero */}
      <div className="text-center mb-12">
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl border-2 mb-6 ${iconClass}`}>
          {IconComponent
            ? <IconComponent className="w-10 h-10" />
            : <span className="text-3xl" role="img" aria-label={tool.title}>{tool.icon}</span>
          }
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{tool.title}</h1>
        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto leading-relaxed">
          {tool.description}
        </p>

        <div className="inline-flex items-center gap-2.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-6 py-3.5 text-sm font-medium">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
          This tool is currently in development — coming soon!
        </div>
      </div>

      {/* Category badge */}
      <div className="flex justify-center mb-12">
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${iconClass}`}>
          {tool.category} Tool · {tool.type === 'backend' ? 'Server-powered' : 'Runs in browser'}
        </span>
      </div>

      {/* Related tools in same category */}
      {related.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Other {tool.category} Tools Available Now
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {related.map(t => {
              const RelIcon = ICON_MAP[t.id];
              const relClass = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.Utility;
              return (
                <Link
                  key={t.id}
                  to={t.path}
                  className="group flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${relClass}`}>
                    {RelIcon
                      ? <RelIcon className="w-5 h-5" />
                      : <span className="text-base">{t.icon}</span>
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                      {t.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{t.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-7 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          ← Browse All Available Tools
        </Link>
      </div>

    </div>
  );
}
