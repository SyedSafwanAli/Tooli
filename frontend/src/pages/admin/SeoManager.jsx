import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import { getSeoMeta, updateSeoMeta, deleteSeoMeta } from '../../services/adminApi';
import { useSEO } from '../../utils/useSEO';

const DEFAULT_PAGES = [
  { path: '/',                    title: 'Tooli — 61 Free Online Tools',           description: 'Free online tools for images, PDF, text, developer utilities, SEO, security and more.' },
  { path: '/tools/compress-image', title: 'Image Compressor — Free Online Tool',   description: 'Compress JPG, PNG, WebP images online for free without losing quality.' },
  { path: '/tools/resize-image',   title: 'Image Resizer — Free Online Tool',      description: 'Resize images to any dimension. Maintain aspect ratio automatically.' },
  { path: '/tools/markdown-pdf',   title: 'Markdown to PDF Converter — Free Tool', description: 'Convert Markdown to PDF or PDF to Markdown online for free.' },
];

function SeoRow({ path: initPath, title: initTitle, description: initDesc, isNew = false, onSave, onDelete }) {
  const [path, setPath]         = useState(initPath);
  const [title, setTitle]       = useState(initTitle);
  const [desc, setDesc]         = useState(initDesc);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const dirty = path !== initPath || title !== initTitle || desc !== initDesc || isNew;

  const handleSave = async () => {
    setSaving(true);
    await onSave({ path, title, description: desc });
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Remove SEO meta for "${path}"?`)) return;
    setDeleting(true);
    await onDelete(path);
    setDeleting(false);
  };

  return (
    <motion.tr
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-gray-50"
    >
      {/* Path */}
      <td className="px-4 py-2.5 align-top">
        <input
          value={path}
          onChange={e => setPath(e.target.value)}
          placeholder="/tools/example"
          className="text-xs font-mono text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none py-0.5 w-full min-w-[160px]"
          readOnly={!isNew}
        />
      </td>
      {/* Title */}
      <td className="px-4 py-2.5 align-top">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Page title…"
          className="text-xs text-gray-700 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none py-0.5 w-full min-w-[200px]"
        />
      </td>
      {/* Description */}
      <td className="px-4 py-2.5 align-top hidden lg:table-cell">
        <input
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Meta description…"
          className="text-xs text-gray-500 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none py-0.5 w-full min-w-[280px]"
        />
      </td>
      {/* Actions */}
      <td className="px-4 py-2.5 text-right align-top">
        <div className="flex items-center justify-end gap-2">
          {dirty && (
            <Button size="sm" variant="primary" loading={saving} onClick={handleSave}>
              Save
            </Button>
          )}
          {!isNew && (
            <Button size="sm" variant="danger" loading={deleting} onClick={handleDelete}>
              ✕
            </Button>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

export default function SeoManager() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  useSEO({ title: 'SEO Manager' });

  const fetchData = () =>
    getSeoMeta()
      .then(r => setMeta(r.data.data || {}))
      .catch(() => setMsg({ type: 'error', text: 'Failed to load SEO meta' }))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
  }, [isAuthenticated]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const handleSave = async ({ path, title, description }) => {
    try {
      await updateSeoMeta(path, title, description);
      setMeta(prev => ({ ...prev, [path]: { title, description } }));
      setShowAdd(false);
      setMsg({ type: 'success', text: `Saved meta for ${path}` });
      setTimeout(() => setMsg(null), 2500);
    } catch {
      setMsg({ type: 'error', text: 'Save failed' });
    }
  };

  const handleDelete = async (path) => {
    try {
      await deleteSeoMeta(path);
      setMeta(prev => { const n = { ...prev }; delete n[path]; return n; });
      setMsg({ type: 'success', text: `Removed meta for ${path}` });
      setTimeout(() => setMsg(null), 2500);
    } catch {
      setMsg({ type: 'error', text: 'Delete failed' });
    }
  };

  const rows = Object.entries(meta);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Manager</h1>
          <p className="text-gray-500 text-sm">{rows.length} custom meta entries</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(a => !a)}>
          + Add Page
        </Button>
      </div>

      {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {/* Seed buttons */}
      {rows.length === 0 && !loading && (
        <div className="card mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">No SEO meta yet. Seed with defaults?</p>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              for (const p of DEFAULT_PAGES) await handleSave(p);
            }}
          >
            Seed defaults
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading SEO meta..." /></div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Path</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Description</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {showAdd && (
                  <SeoRow
                    key="__new__"
                    path=""
                    title=""
                    description=""
                    isNew
                    onSave={handleSave}
                    onDelete={() => setShowAdd(false)}
                  />
                )}
                {rows.map(([path, { title, description }]) => (
                  <SeoRow
                    key={path}
                    path={path}
                    title={title}
                    description={description}
                    onSave={handleSave}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {rows.length === 0 && !showAdd && (
            <p className="text-center text-gray-400 text-sm py-10">
              No SEO meta configured. Click "+ Add Page" to start.
            </p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
