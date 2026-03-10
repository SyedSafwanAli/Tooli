import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ICON_MAP } from './Icons';

const CATEGORY_STYLES = {
  Images:     { badge: 'bg-blue-100 text-blue-700',    icon: 'bg-blue-50 text-blue-600',    border: 'hover:border-blue-200' },
  PDF:        { badge: 'bg-red-100 text-red-700',      icon: 'bg-red-50 text-red-600',      border: 'hover:border-red-200' },
  Text:       { badge: 'bg-green-100 text-green-700',  icon: 'bg-green-50 text-green-600',  border: 'hover:border-green-200' },
  Developer:  { badge: 'bg-purple-100 text-purple-700', icon: 'bg-purple-50 text-purple-600', border: 'hover:border-purple-200' },
  Security:   { badge: 'bg-amber-100 text-amber-700',  icon: 'bg-amber-50 text-amber-600',  border: 'hover:border-amber-200' },
  SEO:        { badge: 'bg-teal-100 text-teal-700',    icon: 'bg-teal-50 text-teal-600',   border: 'hover:border-teal-200' },
  Calculator: { badge: 'bg-orange-100 text-orange-700', icon: 'bg-orange-50 text-orange-600', border: 'hover:border-orange-200' },
  Utility:    { badge: 'bg-slate-100 text-slate-700',  icon: 'bg-slate-50 text-slate-600',  border: 'hover:border-slate-200' },
};

export default function ToolCard({ tool }) {
  const styles = CATEGORY_STYLES[tool.category] || CATEGORY_STYLES.Utility;
  const IconComponent = ICON_MAP[tool.id];

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 28px -6px rgba(0,0,0,0.10)' }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
    >
      <Link
        to={tool.path}
        className={`block bg-white rounded-2xl border border-gray-100 p-5 shadow-sm group ${styles.border} transition-colors duration-200`}
        aria-label={`Open ${tool.title} tool`}
      >
        <div className="flex items-start gap-4">
          {/* Icon block */}
          <div className={`flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${styles.icon}`}>
            {IconComponent
              ? <IconComponent className="w-6 h-6" />
              : <span className="text-xl" role="img" aria-label={tool.title}>{tool.icon}</span>
            }
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug text-sm">
                {tool.title}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${styles.badge}`}>
                {tool.category}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{tool.description}</p>
          </div>
        </div>

        {/* Use Tool CTA */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-gray-400">{tool.type === 'backend' ? '⚡ Server-powered' : '🌐 Runs in browser'}</span>
          <span className="text-xs font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
            Use tool <span className="transition-transform group-hover:translate-x-1 inline-block">→</span>
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
