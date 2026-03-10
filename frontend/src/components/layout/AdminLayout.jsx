import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
      { to: '/admin/ai-insights', icon: '🤖', label: 'AI Insights' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/blog',   icon: '✍️',  label: 'Blog' },
      { to: '/admin/guides', icon: '📚', label: 'Guides' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/tools', icon: '🔧', label: 'Tools' },
      { to: '/admin/seo',   icon: '🔍', label: 'SEO' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/admin/analytics', icon: '📈', label: 'Analytics' },
      { to: '/admin/revenue',   icon: '💰', label: 'Revenue' },
      { to: '/admin/users',     icon: '👥', label: 'Users' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/logs',   icon: '📋', label: 'File Logs' },
      { to: '/admin/system', icon: '🖥️',  label: 'System' },
    ],
  },
];

const sidebarVariants = {
  hidden: { x: -16, opacity: 0 },
  visible: {
    x: 0, opacity: 1,
    transition: { when: 'beforeChildren', staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { x: -10, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 320, damping: 24 } },
};

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="w-60 bg-gray-900 text-white flex flex-col shrink-0 shadow-xl"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-gray-800 shrink-0">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-white">
            <span className="bg-[#2563EB] text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
              T
            </span>
            <span>
              Tooli{' '}
              <span className="text-gray-500 font-normal text-xs">Admin</span>
            </span>
          </Link>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 py-3 px-3 space-y-4 overflow-y-auto">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider px-2 mb-1">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ to, icon, label }) => (
                  <motion.div key={to} variants={itemVariants}>
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors duration-150 ${
                          isActive
                            ? 'bg-[#2563EB] text-white shadow shadow-blue-900/30'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`
                      }
                    >
                      <span className="text-base leading-none">{icon}</span>
                      {label}
                    </NavLink>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <motion.div variants={itemVariants} className="p-4 border-t border-gray-800 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.username?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.username}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <span>→</span> Sign out
          </button>
        </motion.div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="max-w-6xl mx-auto px-6 py-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
