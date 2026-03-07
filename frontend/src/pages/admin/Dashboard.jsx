import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAnalyticsSummary, getRevenueSummary } from '../../services/adminApi';
import { formatNumber, formatCurrency } from '../../utils/formatters';
import { useSEO } from '../../utils/useSEO';

function KpiCard({ icon, label, value, sub, linkTo, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-400 to-orange-500',
  };

  const card = (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-2xl p-6 shadow`}>
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm opacity-80 mt-1">{label}</div>
      {sub && <div className="text-xs opacity-60 mt-1">{sub}</div>}
    </div>
  );

  return linkTo ? <Link to={linkTo}>{card}</Link> : card;
}

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({ title: 'Admin Dashboard' });

  useEffect(() => {
    if (!isAuthenticated) return;
    Promise.all([getAnalyticsSummary(30), getRevenueSummary()])
      .then(([a, r]) => {
        setAnalytics(a.data.data);
        setRevenue(r.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const topTools = analytics
    ? Object.entries(analytics.toolUsage || {}).sort((a, b) => b[1] - a[1]).slice(0, 5)
    : [];

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
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard
              icon="👁️"
              label="Page Views (30d)"
              value={formatNumber(analytics?.totalViews)}
              linkTo="/admin/analytics"
              color="blue"
            />
            <KpiCard
              icon="💰"
              label="Total Revenue"
              value={formatCurrency(revenue?.total)}
              sub={`${formatNumber(revenue?.count)} entries`}
              linkTo="/admin/revenue"
              color="green"
            />
            <KpiCard
              icon="🛠️"
              label="Tool Uses"
              value={formatNumber(Object.values(analytics?.toolUsage || {}).reduce((a, b) => a + b, 0))}
              color="purple"
            />
            <KpiCard
              icon="📅"
              label="Active Days"
              value={formatNumber(analytics?.byDay?.length)}
              color="orange"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Top Pages</h2>
              {analytics?.topPages?.length ? (
                <div className="space-y-2">
                  {analytics.topPages.slice(0, 8).map(({ path, count }) => (
                    <div key={path} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 truncate max-w-xs">{path}</span>
                      <span className="font-semibold text-gray-900 ml-2">{formatNumber(count)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No page views yet.</p>
              )}
              <Link to="/admin/analytics" className="mt-4 block text-xs text-blue-600 hover:underline">
                View full analytics →
              </Link>
            </div>

            {/* Top Tools */}
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Most Used Tools</h2>
              {topTools.length ? (
                <div className="space-y-3">
                  {topTools.map(([tool, count]) => (
                    <div key={tool} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium">{tool}</span>
                          <span className="text-gray-500">{formatNumber(count)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${(count / topTools[0][1]) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No tool usage yet.</p>
              )}
            </div>
          </div>

          {/* Recent Revenue */}
          {revenue?.byMonth?.length > 0 && (
            <div className="card mt-6">
              <h2 className="font-semibold text-gray-900 mb-4">Revenue by Month</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {revenue.byMonth.slice(-6).map(({ month, amount }) => (
                  <div key={month} className="shrink-0 text-center">
                    <div className="text-xs text-gray-500">{month}</div>
                    <div className="font-bold text-green-600">{formatCurrency(amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
