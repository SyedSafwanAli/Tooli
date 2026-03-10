import { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { getLogs, clearLogs } from '../../services/adminApi';
import { formatNumber } from '../../utils/formatters';
import { useSEO } from '../../utils/useSEO';

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function FileLogs() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [msg, setMsg] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const intervalRef = useRef(null);

  useSEO({ title: 'File Logs' });

  const fetchData = () =>
    getLogs()
      .then(r => setData(r.data.data))
      .catch(() => setMsg({ type: 'error', text: 'Failed to load logs' }))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(fetchData, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRefresh, isAuthenticated]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const handleClear = async () => {
    if (!confirm('Clear all file processing logs? This cannot be undone.')) return;
    setClearing(true);
    try {
      await clearLogs();
      setMsg({ type: 'success', text: 'Logs cleared' });
      fetchData();
    } catch {
      setMsg({ type: 'error', text: 'Failed to clear logs' });
    } finally {
      setClearing(false);
    }
  };

  const entries = data?.entries || [];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">File Logs</h1>
          <p className="text-gray-500 text-sm">
            {formatNumber(data?.total ?? 0)} total entries — showing last {entries.length}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="rounded"
            />
            Auto (5s)
          </label>
          <button
            onClick={fetchData}
            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            ↻ Refresh
          </button>
          <Button variant="danger" size="sm" onClick={handleClear} loading={clearing}>
            Clear Logs
          </Button>
        </div>
      </div>

      {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading logs..." /></div>
      ) : entries.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-gray-500">No file processing logs yet.</p>
          <p className="text-gray-400 text-sm mt-1">Process an image to see entries here.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Time</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tool</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Filename</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Size</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Duration</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <motion.tr
                  key={entry.id || i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.01 }}
                  className={`border-b border-gray-50 ${
                    entry.status === 'error'
                      ? 'bg-red-50 hover:bg-red-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-2.5 text-gray-500 text-xs font-mono whitespace-nowrap">
                    {formatDate(entry.timestamp)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-mono">
                      {entry.tool ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600 text-xs truncate max-w-[200px] hidden md:table-cell">
                    {entry.filename ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500 text-xs hidden sm:table-cell">
                    {formatBytes(entry.fileSize)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500 text-xs tabular-nums">
                    {entry.duration != null ? `${entry.duration}ms` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {entry.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        ✓ OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
                        ✗ Error
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
