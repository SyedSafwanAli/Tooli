import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { TOOLS } from '../../constants/tools';
import { getToolOverrides, updateToolOverride } from '../../services/adminApi';
import { useSEO } from '../../utils/useSEO';

const CATEGORIES = ['All', ...Array.from(new Set(TOOLS.map(t => t.category))).sort()];

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-[#2563EB]' : 'bg-gray-200'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow ${checked ? 'translate-x-4' : 'translate-x-1'}`}
      />
    </button>
  );
}

export default function ToolsManager() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [overrides, setOverrides] = useState({});
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({ title: 'Tools Manager' });

  useEffect(() => {
    if (!isAuthenticated) return;
    getToolOverrides()
      .then(r => setOverrides(r.data.data || {}))
      .catch(() => setMsg({ type: 'error', text: 'Failed to load tool overrides' }))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const visible = TOOLS.filter(t => {
    if (category !== 'All' && t.category !== category) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getField = (id, field, fallback) =>
    edits[id]?.[field] !== undefined
      ? edits[id][field]
      : overrides[id]?.[field] !== undefined
        ? overrides[id][field]
        : fallback;

  const setEdit = (id, field, value) =>
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

  const handleSave = async (id) => {
    const payload = edits[id];
    if (!payload) return;
    setSaving(s => ({ ...s, [id]: true }));
    try {
      const r = await updateToolOverride(id, payload);
      setOverrides(prev => ({ ...prev, [id]: { ...prev[id], ...r.data.data } }));
      setEdits(prev => { const n = { ...prev }; delete n[id]; return n; });
      setMsg({ type: 'success', text: `Saved "${id}"` });
      setTimeout(() => setMsg(null), 2500);
    } catch {
      setMsg({ type: 'error', text: 'Save failed' });
    } finally {
      setSaving(s => ({ ...s, [id]: false }));
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tools Manager</h1>
          <p className="text-gray-500 text-sm">{TOOLS.length} tools — toggle, feature, or rename</p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tools…"
          className="input py-1.5 text-sm w-52"
        />
      </div>

      {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              category === c
                ? 'bg-[#2563EB] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading tools..." /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Tool</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden xl:table-cell">Description</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Enabled</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Featured</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((tool, i) => {
                const enabled  = getField(tool.id, 'enabled', true);
                const featured = getField(tool.id, 'featured', false);
                const dirty = !!edits[tool.id];

                return (
                  <motion.tr
                    key={tool.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.012 }}
                    className={`border-b border-gray-50 hover:bg-gray-50 ${!enabled ? 'opacity-50' : ''}`}
                  >
                    {/* Title (editable) */}
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-base leading-none">{tool.icon}</span>
                        <input
                          value={getField(tool.id, 'title', tool.title)}
                          onChange={e => setEdit(tool.id, 'title', e.target.value)}
                          className="font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none text-sm py-0.5 w-full max-w-[160px]"
                        />
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-2.5 text-gray-500 text-xs hidden lg:table-cell">
                      {tool.category}
                    </td>

                    {/* Description (editable) */}
                    <td className="px-4 py-2.5 hidden xl:table-cell">
                      <input
                        value={getField(tool.id, 'description', tool.description)}
                        onChange={e => setEdit(tool.id, 'description', e.target.value)}
                        className="text-gray-500 text-xs bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none py-0.5 w-full max-w-xs"
                      />
                    </td>

                    {/* Enabled toggle */}
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={enabled}
                          onChange={v => setEdit(tool.id, 'enabled', v)}
                        />
                      </div>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center">
                        <Toggle
                          checked={featured}
                          onChange={v => setEdit(tool.id, 'featured', v)}
                        />
                      </div>
                    </td>

                    {/* Save */}
                    <td className="px-4 py-2.5 text-right">
                      {dirty && (
                        <Button
                          size="sm"
                          variant="primary"
                          loading={saving[tool.id]}
                          onClick={() => handleSave(tool.id)}
                        >
                          Save
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">No tools match your filter.</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
