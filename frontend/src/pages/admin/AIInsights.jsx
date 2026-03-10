import { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getAIInsights } from '../../services/adminApi';
import { formatNumber } from '../../utils/formatters';
import { useSEO } from '../../utils/useSEO';

const TYPE_COLORS = {
  best:        'border-l-4 border-[#2563EB] bg-blue-50',
  worst:       'border-l-4 border-orange-400 bg-orange-50',
  growing:     'border-l-4 border-emerald-500 bg-emerald-50',
  declining:   'border-l-4 border-red-400 bg-red-50',
  opportunity: 'border-l-4 border-violet-500 bg-violet-50',
  revenue:     'border-l-4 border-amber-400 bg-amber-50',
  empty:       'border-l-4 border-gray-300 bg-gray-50',
};

function InsightCard({ insight, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className={`rounded-xl p-4 ${TYPE_COLORS[insight.type] || TYPE_COLORS.empty}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5">{insight.icon}</span>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
            {insight.title}
          </p>
          <p className="text-sm text-gray-800 leading-relaxed">{insight.message}</p>
          {insight.tool && (
            <Link
              to={`/tools/${insight.tool}`}
              target="_blank"
              className="inline-block mt-1.5 text-xs text-blue-600 hover:underline"
            >
              View tool →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AIInsights() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useSEO({ title: 'AI Insights' });

  const fetchData = (d = days) => {
    setLoading(true);
    getAIInsights(d)
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData(days);
  }, [isAuthenticated, days]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const chartData = (data?.stats?.topTools || []).map(t => ({
    name: t.label?.split(' ').slice(0, 2).join(' ') || t.slug,
    current: t.curr,
    previous: t.prev,
  }));

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
          <p className="text-gray-500 text-sm">Automated analysis of tool performance and growth</p>
        </div>
        <select
          value={days}
          onChange={e => setDays(+e.target.value)}
          className="input py-1.5 text-sm w-auto"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Generating insights…" /></div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total Tool Uses',   value: formatNumber(data?.stats?.totalUses), icon: '🛠️' },
              { label: 'Unique Tools Used', value: formatNumber(data?.stats?.uniqueTools), icon: '🗂️' },
              { label: 'Page Views',        value: formatNumber(data?.stats?.totalViews), icon: '👁️' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card text-center"
              >
                <span className="text-2xl">{s.icon}</span>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value ?? '—'}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Insights list */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                🤖 <span>Insights</span>
                <span className="text-xs text-gray-400 font-normal">({data?.insights?.length ?? 0})</span>
              </h2>
              <div className="space-y-3">
                {(data?.insights || []).map((ins, i) => (
                  <InsightCard key={i} insight={ins} index={i} />
                ))}
              </div>
            </div>

            {/* Top tools chart */}
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Tool Usage — Current vs Previous Period</h2>
              {chartData.length > 0 ? (
                <div className="card">
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip
                        formatter={(v, name) => [v, name === 'current' ? 'This period' : 'Prev period']}
                      />
                      <Bar dataKey="current"  fill="#2563EB" radius={[0, 4, 4, 0]} name="current" />
                      <Bar dataKey="previous" fill="#93c5fd" radius={[0, 4, 4, 0]} name="previous" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="card text-center py-10">
                  <p className="text-gray-400 text-sm">No tool usage data yet.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
