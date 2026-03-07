import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TOOLS } from '../../constants/tools';
import { ICON_MAP } from './Icons';
import { buildBreadcrumbSchema } from '../../utils/useSEO';

const ICON_COLORS = {
  Images:     'bg-blue-50 text-blue-600 border-blue-100',
  PDF:        'bg-red-50 text-red-600 border-red-100',
  Text:       'bg-green-50 text-green-600 border-green-100',
  Developer:  'bg-purple-50 text-purple-600 border-purple-100',
  Security:   'bg-amber-50 text-amber-600 border-amber-100',
  SEO:        'bg-teal-50 text-teal-600 border-teal-100',
  Calculator: 'bg-orange-50 text-orange-600 border-orange-100',
  Utility:    'bg-slate-50 text-slate-600 border-slate-100',
};

const CATEGORY_CARD_COLORS = {
  Images:     'bg-blue-50 text-blue-600 group-hover:bg-blue-100 border-blue-100',
  PDF:        'bg-red-50 text-red-600 group-hover:bg-red-100 border-red-100',
  Text:       'bg-green-50 text-green-600 group-hover:bg-green-100 border-green-100',
  Developer:  'bg-purple-50 text-purple-600 group-hover:bg-purple-100 border-purple-100',
  Security:   'bg-amber-50 text-amber-600 group-hover:bg-amber-100 border-amber-100',
  SEO:        'bg-teal-50 text-teal-600 group-hover:bg-teal-100 border-teal-100',
  Calculator: 'bg-orange-50 text-orange-600 group-hover:bg-orange-100 border-orange-100',
  Utility:    'bg-slate-50 text-slate-600 group-hover:bg-slate-100 border-slate-100',
};

function FAQItem({ q, a, index }) {
  return (
    <div className="border-b border-gray-100 pb-5 last:border-0 last:pb-0">
      <h3 className="font-semibold text-gray-800 mb-2 text-sm leading-snug flex gap-2">
        <span className="text-blue-500 shrink-0">Q{index + 1}.</span>
        <span>{q}</span>
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed pl-6">{a}</p>
    </div>
  );
}

function RelatedToolCard({ tool }) {
  const IconComponent = ICON_MAP[tool.id];
  const iconClass = CATEGORY_CARD_COLORS[tool.category] || CATEGORY_CARD_COLORS.Utility;

  return (
    <Link
      to={tool.path}
      className="group flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all duration-200"
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center transition-colors ${iconClass}`}>
        {IconComponent
          ? <IconComponent className="w-5 h-5" />
          : <span className="text-base">{tool.icon}</span>
        }
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
          {tool.title}
        </p>
        <p className="text-xs text-gray-400 truncate">{tool.description}</p>
      </div>
    </Link>
  );
}

/**
 * ToolLayout — consistent wrapper for every tool page.
 *
 * Props:
 *   title       — tool name shown as H1
 *   description — short subtitle
 *   icon        — JSX SVG element (from Icons.jsx)
 *   category    — tool category string (controls icon bg colour)
 *   seoContent  — { about: string|string[], howTo: string[], features: string[], faq: [{q,a}] }
 *   children    — the actual tool UI
 */
export default function ToolLayout({ title, description, icon, category, seoContent, children }) {
  const location = useLocation();
  const iconClass = ICON_COLORS[category] || 'bg-blue-50 text-blue-600 border-blue-100';

  // Find current tool + pick 5 related tools (same category first, then others)
  const relatedTools = useMemo(() => {
    const current = TOOLS.find(t => t.path === location.pathname);
    const sameCategory = TOOLS.filter(t => t.category === category && t.path !== location.pathname);
    const otherCategory = TOOLS.filter(t => t.category !== category && t.path !== location.pathname);
    const pool = [...sameCategory, ...otherCategory];
    return pool.slice(0, 6);
  }, [location.pathname, category]);

  // Inject breadcrumb JSON-LD directly (no hook — avoids double-mounting issues)
  const breadcrumbSchema = useMemo(() => {
    const items = [{ name: 'Home', url: '/' }];
    if (category) items.push({ name: category, url: `/?category=${category}` });
    if (title) items.push({ name: title, url: location.pathname });
    return buildBreadcrumbSchema(items);
  }, [title, category, location.pathname]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Breadcrumb nav */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-1 flex-wrap" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span className="text-gray-300">›</span>
        {category && (
          <>
            <Link to={`/?category=${category}`} className="hover:text-blue-600 transition-colors">
              {category}
            </Link>
            <span className="text-gray-300">›</span>
          </>
        )}
        <span className="text-gray-900 font-medium">{title}</span>
      </nav>

      {/* Tool Header */}
      <header className="text-center mb-8">
        {icon && (
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl border mb-4 ${iconClass}`}>
            <span className="w-8 h-8 flex items-center justify-center">{icon}</span>
          </div>
        )}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-2 text-gray-500 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        )}
      </header>

      {/* Tool UI (passed as children) */}
      <div className="space-y-4">
        {children}
      </div>

      {/* ───── Related Tools ───── */}
      {relatedTools.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Related Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {relatedTools.map(tool => (
              <RelatedToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* ───── SEO Content Section ───── */}
      {seoContent && (
        <div className="mt-14 pt-10 border-t border-gray-100 space-y-10">

          {/* About */}
          {seoContent.about && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">About the {title}</h2>
              <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                {(Array.isArray(seoContent.about) ? seoContent.about : [seoContent.about]).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          )}

          {/* How to Use */}
          {seoContent.howTo?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">How to Use the {title}</h2>
              <ol className="space-y-3">
                {seoContent.howTo.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm leading-relaxed">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Features */}
          {seoContent.features?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Key Features</h2>
              <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                {seoContent.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 mt-0.5 flex-shrink-0 font-bold">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* FAQ */}
          {seoContent.faq?.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
              <div className="space-y-5">
                {seoContent.faq.map((item, i) => (
                  <FAQItem key={i} q={item.q} a={item.a} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-center text-white">
            <h2 className="font-bold text-lg mb-1">Need another free tool?</h2>
            <p className="text-blue-100 text-sm mb-4">Explore all 60 tools — no signup, no watermarks, no limits.</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm"
            >
              Browse All 60 Tools →
            </Link>
          </div>

        </div>
      )}
    </div>
  );
}
