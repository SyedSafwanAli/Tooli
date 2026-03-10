import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import MarkdownEditor from '../../components/admin/MarkdownEditor';
import { TOOLS } from '../../constants/tools';
import {
  getAdminGuides, getAdminGuide, createGuide, updateGuide, deleteGuide,
} from '../../services/adminApi';
import { useSEO } from '../../utils/useSEO';

const CATEGORIES = ['Images', 'PDF', 'Text', 'Developer', 'Security', 'SEO', 'Calculator', 'Utility'];

const EMPTY_FORM = {
  title: '', content: '', contentType: 'markdown',
  metaTitle: '', metaDescription: '',
  category: 'Images', relatedTool: '', readTime: '5',
  tags: '', status: 'draft',
};

function StatusBadge({ status }) {
  return status === 'published'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">● Published</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">○ Draft</span>;
}

export default function GuidesManager() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [guides, setGuides]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg]           = useState(null);

  useSEO({ title: 'Guides Manager' });

  const fetchGuides = () =>
    getAdminGuides()
      .then(r => setGuides(r.data.data || []))
      .catch(() => setMsg({ type: 'error', text: 'Failed to load guides' }))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchGuides();
  }, [isAuthenticated]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const openNew = () => {
    setForm(EMPTY_FORM);
    setEditing('new');
  };

  const openEdit = async (guide) => {
    setLoading(true);
    try {
      const r = await getAdminGuide(guide.id);
      const g = r.data.data;
      setForm({
        title: g.title || '', content: g.content || '',
        contentType: g.contentType || 'markdown',
        metaTitle: g.metaTitle || '', metaDescription: g.metaDescription || '',
        category: g.category || 'Images',
        relatedTool: g.relatedTool || '',
        readTime: String(g.readTime || 5),
        tags: (g.tags || []).join(', '),
        status: g.status || 'draft',
      });
      setEditing(g);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load guide' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (statusOverride) => {
    const payload = { ...form, status: statusOverride || form.status };
    setSaving(true);
    try {
      if (editing === 'new') {
        const r = await createGuide(payload);
        setGuides(prev => [r.data.data, ...prev]);
        setMsg({ type: 'success', text: 'Guide created!' });
      } else {
        const r = await updateGuide(editing.id, payload);
        setGuides(prev => prev.map(g => g.id === editing.id ? { ...g, ...r.data.data } : g));
        setMsg({ type: 'success', text: 'Guide updated!' });
      }
      setEditing(null);
      setTimeout(() => setMsg(null), 3000);
    } catch {
      setMsg({ type: 'error', text: 'Save failed' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this guide permanently?')) return;
    setDeleting(id);
    try {
      await deleteGuide(id);
      setGuides(prev => prev.filter(g => g.id !== id));
      setMsg({ type: 'success', text: 'Guide deleted' });
      setTimeout(() => setMsg(null), 2500);
    } catch {
      setMsg({ type: 'error', text: 'Delete failed' });
    } finally {
      setDeleting(null);
    }
  };

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── Edit / New form ───────────────────────────────────────────────────────

  if (editing !== null) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditing(null)}
              className="text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1.5 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {editing === 'new' ? 'New Guide' : 'Edit Guide'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleSave('draft')} disabled={saving}>
              Save as Draft
            </Button>
            <Button variant="primary" size="sm" loading={saving} onClick={() => handleSave('published')}>
              Publish
            </Button>
          </div>
        </div>

        {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="card space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  className="input w-full text-lg font-semibold"
                  placeholder="Guide title…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Content (Markdown)</label>
                <MarkdownEditor
                  value={form.content}
                  onChange={v => setField('content', v)}
                  contentType={form.contentType}
                  onContentTypeChange={v => setField('contentType', v)}
                  minHeight="min-h-[480px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Publish */}
            <div className="card space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Settings</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => setField('status', e.target.value)} className="input w-full text-sm">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                <select value={form.category} onChange={e => setField('category', e.target.value)} className="input w-full text-sm">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Related Tool</label>
                <select value={form.relatedTool} onChange={e => setField('relatedTool', e.target.value)} className="input w-full text-sm">
                  <option value="">— None —</option>
                  {TOOLS.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Read time (min)</label>
                <input
                  type="number" min={1} max={60}
                  value={form.readTime} onChange={e => setField('readTime', e.target.value)}
                  className="input w-full text-sm"
                />
              </div>
              <Button variant="primary" size="sm" className="w-full justify-center" loading={saving} onClick={() => handleSave()}>
                Save
              </Button>
            </div>

            {/* SEO */}
            <div className="card space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">SEO</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta title</label>
                <input value={form.metaTitle} onChange={e => setField('metaTitle', e.target.value)} className="input w-full text-sm" placeholder="Auto-filled from title" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta description</label>
                <textarea
                  value={form.metaDescription} onChange={e => setField('metaDescription', e.target.value)}
                  className="input w-full text-sm resize-none" rows={3} placeholder="160 chars max…" maxLength={160}
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{form.metaDescription.length}/160</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tags</label>
                <input value={form.tags} onChange={e => setField('tags', e.target.value)} className="input w-full text-sm" placeholder="seo, compress, guide" />
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guides Manager</h1>
          <p className="text-gray-500 text-sm">{guides.length} admin-managed guides</p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>+ New Guide</Button>
      </div>

      {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading guides…" /></div>
      ) : guides.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-gray-500">No admin-managed guides yet.</p>
          <p className="text-gray-400 text-xs mt-1">Existing guides in the frontend constants still work independently.</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={openNew}>Write first guide</Button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Category</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Published</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {guides.map((guide, i) => (
                  <motion.tr
                    key={guide.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{guide.title}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{guide.category}</td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={guide.status} /></td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs hidden md:table-cell">
                      {guide.publishedAt ? new Date(guide.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(guide)}>Edit</Button>
                        <Button
                          size="sm" variant="danger"
                          loading={deleting === guide.id}
                          onClick={() => handleDelete(guide.id)}
                        >✕</Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
