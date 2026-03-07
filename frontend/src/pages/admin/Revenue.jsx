import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import {
  getRevenue, addRevenue, updateRevenue, deleteRevenue, getRevenueSummary,
} from '../../services/adminApi';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useSEO } from '../../utils/useSEO';
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
const CATEGORIES = ['Ads', 'Subscriptions', 'Donations', 'Sponsorships', 'Services', 'Other'];

const emptyForm = { amount: '', description: '', category: 'Other', date: new Date().toISOString().slice(0, 10) };

export default function Revenue() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useSEO({ title: 'Revenue' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [e, s] = await Promise.all([getRevenue(), getRevenueSummary()]);
      setEntries(e.data.data.sort((a, b) => b.date.localeCompare(a.date)));
      setSummary(s.data.data);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchAll();
  }, [isAuthenticated]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) {
        await updateRevenue(editId, form);
        setMsg({ type: 'success', text: 'Entry updated' });
      } else {
        await addRevenue(form);
        setMsg({ type: 'success', text: 'Entry added' });
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry) => {
    setForm({ amount: entry.amount, description: entry.description, category: entry.category, date: entry.date });
    setEditId(entry.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    try {
      await deleteRevenue(id);
      setMsg({ type: 'success', text: 'Entry deleted' });
      fetchAll();
    } catch {
      setMsg({ type: 'error', text: 'Failed to delete' });
    }
  };

  const pieData = summary?.byCategory?.map(({ category, amount }) => ({ name: category, value: amount })) || [];

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
          <p className="text-gray-500 text-sm">Track and manage revenue entries</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm(emptyForm); }}>
          + Add Entry
        </Button>
      </div>

      {msg && <div className="mb-4"><Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} /></div>}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="card mb-6 border-2 border-blue-100">
          <h2 className="font-semibold text-gray-900 mb-4">{editId ? 'Edit Entry' : 'New Revenue Entry'}</h2>
          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                required
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="label">Category</label>
              <select
                className="input"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <input
                type="text"
                className="input"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
                placeholder="e.g. Google AdSense - March"
              />
            </div>
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <Button type="submit" loading={saving}>{editId ? 'Update' : 'Add Entry'}</Button>
              <Button type="button" variant="secondary" onClick={() => { setShowForm(false); setEditId(null); }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading..." /></div>
      ) : (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary?.total)}</div>
              <div className="text-xs text-gray-500 mt-1">Total Revenue</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600">{summary?.count || 0}</div>
              <div className="text-xs text-gray-500 mt-1">Entries</div>
            </div>
            <div className="card text-center col-span-2 lg:col-span-1">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(summary?.byMonth?.slice(-1)[0]?.amount)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Latest Month</div>
            </div>
          </div>

          {/* Charts */}
          {summary?.byMonth?.length > 0 && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={summary.byMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v}`} />
                    <Tooltip formatter={(v) => formatCurrency(v)} />
                    <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {pieData.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold text-gray-900 mb-4">By Category</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Entries table */}
          <div className="card overflow-x-auto">
            <h2 className="font-semibold text-gray-900 mb-4">All Entries</h2>
            {entries.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No entries yet. Add your first revenue entry above.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-500 font-medium">
                    <th className="text-left py-2 pr-4">Date</th>
                    <th className="text-left py-2 pr-4">Description</th>
                    <th className="text-left py-2 pr-4">Category</th>
                    <th className="text-right py-2 pr-4">Amount</th>
                    <th className="text-right py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map(entry => (
                    <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2.5 pr-4 text-gray-500">{formatDate(entry.date)}</td>
                      <td className="py-2.5 pr-4 text-gray-800">{entry.description}</td>
                      <td className="py-2.5 pr-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {entry.category}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right font-semibold text-green-700">
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:underline mr-3 text-xs">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(entry.id)} className="text-red-600 hover:underline text-xs">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
