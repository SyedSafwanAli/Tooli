import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getSystemHealth } from '../../services/adminApi';
import { useSEO } from '../../utils/useSEO';

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function MiniBar({ used, total, color = 'bg-[#2563EB]' }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>{used} MB used</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`h-full rounded-full ${pct > 80 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : color}`}
        />
      </div>
      <div className="text-xs text-gray-400 mt-0.5">{total} MB total</div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, index, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      className="card"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <span className="text-sm font-medium text-gray-500">{label}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value ?? '—'}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
      {children}
    </motion.div>
  );
}

export default function SystemHealth() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  useSEO({ title: 'System Health' });

  const fetchData = () =>
    getSystemHealth()
      .then(r => setData(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 10000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, isAuthenticated]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const loadAvg = data?.os?.loadAvg?.map(v => v.toFixed(2)).join(' / ') ?? '—';

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Health</h1>
          <p className="text-gray-500 text-sm">Process memory, OS stats, Node.js info</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto-refresh (10s)
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
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading system info..." /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatCard icon="⏱️" label="Server Uptime" value={formatUptime(data?.uptime ?? 0)} index={0} />

            <StatCard
              icon="🧠"
              label="Heap Memory"
              value={`${data?.memory?.heapUsed ?? 0} MB`}
              index={1}
            >
              <MiniBar used={data?.memory?.heapUsed ?? 0} total={data?.memory?.heapTotal ?? 1} />
            </StatCard>

            <StatCard
              icon="💾"
              label="RSS Memory"
              value={`${data?.memory?.rss ?? 0} MB`}
              sub="Resident Set Size"
              index={2}
            />

            <StatCard
              icon="🖥️"
              label="System Memory"
              value={`${((data?.os?.totalMem ?? 0) - (data?.os?.freeMem ?? 0))} MB used`}
              index={3}
            >
              <MiniBar
                used={(data?.os?.totalMem ?? 0) - (data?.os?.freeMem ?? 0)}
                total={data?.os?.totalMem ?? 1}
              />
            </StatCard>

            <StatCard
              icon="⚡"
              label="CPU Cores"
              value={data?.os?.cpuCount ?? '—'}
              sub={`Load avg: ${loadAvg}`}
              index={4}
            />

            <StatCard
              icon="🟢"
              label="Environment"
              value={data?.env ?? '—'}
              sub={`Node ${data?.os?.nodeVersion ?? ''}`}
              index={5}
            />
          </div>

          {/* Timestamp */}
          {data?.timestamp && (
            <p className="text-xs text-gray-400 text-right">
              Last updated: {new Date(data.timestamp).toLocaleTimeString()}
            </p>
          )}
        </>
      )}
    </AdminLayout>
  );
}
