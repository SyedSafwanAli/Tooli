import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getUserStats } from '../../services/adminApi';
import { formatNumber } from '../../utils/formatters';
import { useSEO } from '../../utils/useSEO';

const PIE_COLORS = ['#2563EB', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function UserActivity() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef(null);

  useSEO({ title: 'User Activity' });

  const fetchData = () =>
    getUserStats()
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    clearInterval(intervalRef.current);
    if (autoRefresh) intervalRef.current = setInterval(fetchData, 15000);
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, isAuthenticated]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const hourlyData  = data?.byHour || [];
  const browserData = data?.browsers || [];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Activity</h1>
          <p className="text-gray-500 text-sm">Today's visitor behaviour derived from page views</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input type="checkbox" checked={autoRefresh} onChange={e => setAutoRefresh(e.target.checked)} className="rounded" />
            Auto (15s)
          </label>
          <button
            onClick={fetchData}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading activity…" /></div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Active Users Today',    value: formatNumber(data?.activeToday),     icon: '👥', color: 'text-blue-600' },
              { label: 'Page Views Today',      value: formatNumber(data?.totalViewsToday), icon: '👁️',  color: 'text-emerald-600' },
              { label: 'Browsers Detected',     value: formatNumber(browserData.length),    icon: '🌐', color: 'text-violet-600' },
              { label: 'Top Paths Today',        value: formatNumber(data?.topPaths?.length),icon: '📄', color: 'text-amber-600' },
            ].map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="card text-center"
              >
                <span className="text-2xl">{k.icon}</span>
                <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value ?? '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Hourly activity */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card lg:col-span-2"
            >
              <h2 className="font-semibold text-gray-900 mb-4">Hourly Activity (Today)</h2>
              {hourlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={3} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[3, 3, 0, 0]} name="Views" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-400 text-sm py-10">No activity data for today yet.</p>
              )}
            </motion.div>

            {/* Browser breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 }}
              className="card"
            >
              <h2 className="font-semibold text-gray-900 mb-4">Browsers</h2>
              {browserData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={browserData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%" cy="50%"
                      outerRadius={70}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {browserData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={v => [v, 'Views']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-400 text-sm py-10">No browser data.</p>
              )}
            </motion.div>
          </div>

          {/* Top paths today */}
          {data?.topPaths?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.46 }}
              className="card mt-6"
            >
              <h2 className="font-semibold text-gray-900 mb-4">Most Visited Pages Today</h2>
              <div className="space-y-2">
                {data.topPaths.map(({ path, count }, i) => (
                  <div key={path} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-0.5">
                        <span className="text-gray-700 font-mono text-xs">{path}</span>
                        <span className="text-gray-500 tabular-nums text-xs">{formatNumber(count)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / data.topPaths[0].count) * 100}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 + i * 0.04 }}
                          className="h-full bg-[#2563EB] rounded-full"
                        />
                      </div>
                    </div>
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
