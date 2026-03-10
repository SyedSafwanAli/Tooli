import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAnalyticsSummary, getRevenueSummary, getLogs } from '../../services/adminApi';
import { formatNumber, formatCurrency } from '../../utils/formatters';
import { useSEO } from '../../utils/useSEO';

const KPI_META = [
  { key: 'views',    label: 'Page Views (30d)',  icon: '👁️',  color: 'bg-[#2563EB]',    linkTo: '/admin/analytics' },
  { key: 'revenue',  label: 'Total Revenue',     icon: '💰',  color: 'bg-emerald-600',  linkTo: '/admin/revenue' },
  { key: 'tools',    label: 'Tool Uses',          icon: '🛠️',  color: 'bg-violet-600',  linkTo: '/admin/analytics' },
  { key: 'files',    label: 'Files Processed',   icon: '📁',  color: 'bg-amber-500',    linkTo: '/admin/logs' },
  { key: 'days',     label: 'Active Days',        icon: '📅',  color: 'bg-sky-600',      linkTo: null },
  { key: 'revenue_count', label: 'Revenue Entries', icon: '🧾', color: 'bg-pink-600',  linkTo: '/admin/revenue' },
];

function KpiCard({ icon, label, value, sub, linkTo, color, index }) {
  const card = (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: '0 8px 24px -4px rgba(0,0,0,0.14)' }}
      className={`${color} text-white rounded-2xl p-5 shadow cursor-default`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold leading-tight">{value ?? '—'}</div>
      <div className="text-sm opacity-80 mt-0.5">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-0.5">{sub}</div>}
    </motion.div>
  );
  return linkTo ? <Link to={linkTo}>{card}</Link> : card;
}

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({ title: 'Admin Dashboard' });

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([
      getAnalyticsSummary(30),
      getRevenueSummary(),
      getLogs(),
    ])
      .then(([a, r, l]) => {
        setAnalytics(a.data.data);
        setRevenue(r.data.data);
        setLogs(l.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const toolUseTotal = Object.values(analytics?.toolUsage || {}).reduce((a, b) => a + b, 0);
  const topTools = Object.entries(analytics?.toolUsage || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const kpiValues = {
    views:         formatNumber(analytics?.totalViews),
    revenue:       formatCurrency(revenue?.total),
    tools:         formatNumber(toolUseTotal),
    files:         formatNumber(logs?.total),
    days:          formatNumber(analytics?.byDay?.length),
    revenue_count: formatNumber(revenue?.count),
  };

  const kpiSubs = {
    revenue: revenue?.count ? `${formatNumber(revenue.count)} entries` : null,
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">Last 30 days overview</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading dashboard..." /></div>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {KPI_META.map((k, i) => (
              <KpiCard
                key={k.key}
                icon={k.icon}
                label={k.label}
                value={kpiValues[k.key]}
                sub={kpiSubs[k.key]}
                linkTo={k.linkTo}
                color={k.color}
                index={i}
              />
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.3 }}
              className="card"
            >
              <h2 className="font-semibold text-gray-900 mb-4">Top Pages</h2>
              {analytics?.topPages?.length ? (
                <div className="space-y-2">
                  {analytics.topPages.slice(0, 8).map(({ path, count }) => (
                    <div key={path} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 truncate max-w-xs font-mono text-xs">{path}</span>
                      <span className="font-semibold text-gray-900 ml-2 tabular-nums">{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No page views yet.</p>
              )}
              <Link to="/admin/analytics" className="mt-4 block text-xs text-blue-600 hover:underline">
                View full analytics →
              </Link>
            </motion.div>

            {/* Top Tools */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.44, duration: 0.3 }}
              className="card"
            >
              <h2 className="font-semibold text-gray-900 mb-4">Most Used Tools</h2>
              {topTools.length ? (
                <div className="space-y-3">
                  {topTools.map(([tool, count]) => (
                    <div key={tool} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium">{tool}</span>
                          <span className="text-gray-500 tabular-nums">{formatNumber(count)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(count / topTools[0][1]) * 100}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
                            className="h-full bg-[#2563EB] rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No tool usage yet.</p>
              )}
            </motion.div>
          </div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            {[
              { to: '/admin/tools',     icon: '🔧', label: 'Manage Tools' },
              { to: '/admin/system',    icon: '🖥️',  label: 'System Health' },
              { to: '/admin/logs',      icon: '📋', label: 'File Logs' },
              { to: '/admin/seo',       icon: '🔍', label: 'SEO Manager' },
            ].map(({ to, icon, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2.5 p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-200 hover:shadow-md transition-all text-sm font-medium text-gray-700 hover:text-blue-700"
              >
                <span className="text-lg">{icon}</span>
                {label}
              </Link>
            ))}
          </motion.div>

          {/* Revenue by Month */}
          {revenue?.byMonth?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56, duration: 0.3 }}
              className="card mt-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4">Revenue by Month</h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {revenue.byMonth.slice(-6).map(({ month, amount }) => (
                  <div key={month} className="shrink-0 text-center min-w-[56px]">
                    <div className="text-xs text-gray-500 mb-0.5">{month}</div>
                    <div className="font-bold text-emerald-600">{formatCurrency(amount)}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
