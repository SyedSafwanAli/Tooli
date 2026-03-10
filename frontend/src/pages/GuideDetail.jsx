import { useState, useEffect } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { marked } from 'marked';
import { GUIDES } from '../constants/guides';
import { TOOLS } from '../constants/tools';
import { useSEO, buildFAQSchema } from '../utils/useSEO';
import api from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

export default function GuideDetail() {
  const { slug } = useParams();
  const localGuide = GUIDES.find(g => g.slug === slug);

  const [apiGuide, setApiGuide] = useState(null);
  const [loading, setLoading] = useState(!localGuide);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (localGuide) return;
    api.get(`/guides-api/${slug}`)
      .then(r => setApiGuide(r.data.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const guide = localGuide || apiGuide;
  const isLocal = !!localGuide;

  const faqSection = isLocal ? guide?.content?.find(s => s.type === 'faq') : null;

  useSEO({
    title: guide?.title || '',
    description: isLocal ? guide?.description : guide?.metaDescription,
    keywords: isLocal ? guide?.keywords : guide?.tags,
    canonical: `/guides/${slug}`,
    jsonLd: faqSection ? [buildFAQSchema(faqSection.items)] : [],
  });

  if (loading) {
    return <div className="flex justify-center py-20"><LoadingSpinner text="Loading guide…" /></div>;
  }
  if (notFound || !guide) return <Navigate to="/guides" replace />;

  const colorClass = CATEGORY_COLORS[guide.category] || CATEGORY_COLORS.Utility;

  // For API guides, resolve relatedTool ID → tool object from TOOLS constant
  const relatedTool = isLocal
    ? guide.relatedTool
    : guide.relatedTool
      ? TOOLS.find(t => t.id === guide.relatedTool)
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-8 flex items-center gap-1 flex-wrap">
        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
        <span className="text-gray-300">›</span>
        <Link to="/guides" className="hover:text-blue-600 transition-colors">Guides</Link>
        <span className="text-gray-300">›</span>
        <span className="text-gray-600">{guide.title}</span>
      </nav>

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClass}`}>
            {guide.category}
          </span>
          <span className="text-xs text-gray-400">{guide.readTime} min read</span>
          {guide.publishedAt && (
            <>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400">
                {new Date(guide.publishedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </>
          )}
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">{guide.title}</h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          {isLocal ? guide.description : guide.metaDescription}
        </p>
      </header>

      {/* Related tool CTA */}
      {relatedTool && (
        <Link
          to={relatedTool.path}
          className="flex items-center gap-4 p-4 mb-10 bg-blue-50 border border-blue-100 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all group"
        >
          <div className="flex-1">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Free Online Tool</p>
            <p className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{relatedTool.title}</p>
            <p className="text-sm text-gray-500">Use this tool now — no signup required</p>
          </div>
          <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Article content */}
      {isLocal ? (
        <article className="prose-guide space-y-6">
          {guide.content.map((section, i) => (
            <GuideSection key={i} section={section} />
          ))}
        </article>
      ) : (
        <article
          className="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
          dangerouslySetInnerHTML={{
            __html: guide.contentType === 'html'
              ? (guide.content || '')
              : marked.parse(guide.content || ''),
          }}
        />
      )}

      {/* Footer nav */}
      <div className="mt-14 pt-8 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
        <Link to="/guides" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          All Guides
        </Link>
        {relatedTool && (
          <Link
            to={relatedTool.path}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Try {relatedTool.title}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

function GuideSection({ section }) {
  switch (section.type) {
    case 'p':
      return <p className="text-gray-700 leading-relaxed">{section.text}</p>;

    case 'h2':
      return <h2 className="text-xl font-bold text-gray-900 mt-8 mb-2">{section.text}</h2>;

    case 'h3':
      return <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-1">{section.text}</h3>;

    case 'ul':
      return (
        <ul className="space-y-2">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-gray-700">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol className="space-y-2">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-gray-700">
              <span className="mt-0.5 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="leading-relaxed pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      );

    case 'steps':
      return (
        <ol className="space-y-3">
          {section.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <p className="text-gray-700 leading-relaxed pt-0.5">{item}</p>
            </li>
          ))}
        </ol>
      );

    case 'callout':
      return <Callout variant={section.variant} text={section.text} />;

    case 'faq':
      return (
        <div className="space-y-4 mt-2">
          {section.items.map((item, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="font-semibold text-gray-900 mb-1.5">{item.q}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

const CALLOUT_STYLES = {
  tip:     { bg: 'bg-blue-50 border-blue-200',   icon: '💡', label: 'Tip',     text: 'text-blue-800' },
  warning: { bg: 'bg-amber-50 border-amber-200', icon: '⚠️', label: 'Warning', text: 'text-amber-800' },
  info:    { bg: 'bg-gray-50 border-gray-200',   icon: 'ℹ️', label: 'Note',    text: 'text-gray-700' },
};

function Callout({ variant = 'tip', text }) {
  const s = CALLOUT_STYLES[variant] || CALLOUT_STYLES.info;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${s.bg}`}>
      <span className="text-lg shrink-0 leading-none mt-0.5">{s.icon}</span>
      <div>
        <p className={`text-sm font-bold mb-1 ${s.text}`}>{s.label}</p>
        <p className={`text-sm leading-relaxed ${s.text}`}>{text}</p>
      </div>
    </div>
  );
}
