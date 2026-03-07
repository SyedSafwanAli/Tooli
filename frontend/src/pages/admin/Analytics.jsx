import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { getAnalyticsSummary, clearAnalytics } from '../../services/adminApi';
import { formatNumber } from '../../utils/formatters';
import { useSEO } from '../../utils/useSEO';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export default function Analytics() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [msg, setMsg] = useState(null);

  useSEO({ title: 'Analytics' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAnalyticsSummary(days);
      setData(res.data.data);
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to load analytics' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated, days]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const handleClear = async () => {
    if (!confirm('Clear all analytics data? This cannot be undone.')) return;
    setClearing(true);
    try {
      await clearAnalytics();
      setMsg({ type: 'success', text: 'Analytics cleared' });
      fetchData();
    } catch {
      setMsg({ type: 'error', text: 'Failed to clear analytics' });
    } finally {
      setClearing(false);
    }
  };

  const toolUsageChart = Object.entries(data?.toolUsage || {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 text-sm">Page views & tool usage</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={e => setDays(+e.target.value)}
            className="input py-1.5 text-sm w-auto"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button variant="danger" size="sm" onClick={handleClear} loading={clearing}>
            Clear Data
          </Button>
        </div>
      </div>

      {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading analytics..." /></div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Views', value: formatNumber(data?.totalViews) },
              { label: 'Unique Pages', value: formatNumber(data?.topPages?.length) },
              { label: 'Tools Used', value: formatNumber(Object.keys(data?.toolUsage || {}).length) },
              { label: 'Total Tool Uses', value: formatNumber(Object.values(data?.toolUsage || {}).reduce((a, b) => a + b, 0)) },
            ].map(({ label, value }) => (
              <div key={label} className="card text-center">
                <div className="text-2xl font-bold text-blue-600">{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Views over time */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Page Views Over Time</h2>
            {data?.byDay?.length ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.byDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} name="Views" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center py-10">No data for this period</p>
            )}
          </div>

          {/* Tool usage */}
          {toolUsageChart.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Tool Usage</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={toolUsageChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} name="Uses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top pages table */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Top Pages</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-500 font-medium">Path</th>
                    <th className="text-right py-2 text-gray-500 font-medium">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.topPages?.map(({ path, count }) => (
                    <tr key={path} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 text-gray-700 font-mono text-xs">{path}</td>
                      <td className="py-2.5 text-right font-semibold text-gray-900">{formatNumber(count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
