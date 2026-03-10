import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/layout/AdminLayout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';
import Button from '../../components/common/Button';
import MarkdownEditor from '../../components/admin/MarkdownEditor';
import {
  getBlogPosts, getBlogPost, createBlogPost, updateBlogPost, deleteBlogPost,
} from '../../services/adminApi';
import { useSEO } from '../../utils/useSEO';

const EMPTY_FORM = {
  title: '', content: '', contentType: 'markdown',
  metaTitle: '', metaDescription: '',
  tags: '', coverImage: '', status: 'draft',
};

function StatusBadge({ status }) {
  return status === 'published'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">● Published</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">○ Draft</span>;
}

export default function BlogManager() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [posts, setPosts]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(null); // null = list, 'new' = new form, post object = edit
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [msg, setMsg]           = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  useSEO({ title: 'Blog Manager' });

  const fetchPosts = () =>
    getBlogPosts()
      .then(r => setPosts(r.data.data || []))
      .catch(() => setMsg({ type: 'error', text: 'Failed to load posts' }))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPosts();
  }, [isAuthenticated]);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const openNew = () => {
    setForm(EMPTY_FORM);
    setCoverFile(null);
    setEditing('new');
  };

  const openEdit = async (post) => {
    setLoading(true);
    try {
      const r = await getBlogPost(post.id);
      const p = r.data.data;
      setForm({
        title: p.title || '', content: p.content || '',
        contentType: p.contentType || 'markdown',
        metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '',
        tags: (p.tags || []).join(', '), coverImage: p.coverImage || '',
        status: p.status || 'draft',
      });
      setCoverFile(null);
      setEditing(p);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load post' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (statusOverride) => {
    const finalStatus = statusOverride || form.status;
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries({ ...form, status: finalStatus }).forEach(([k, v]) => fd.append(k, v));
      if (coverFile) fd.append('cover', coverFile);

      if (editing === 'new') {
        const r = await createBlogPost(fd);
        setPosts(prev => [r.data.data, ...prev]);
        setMsg({ type: 'success', text: 'Post created!' });
      } else {
        const r = await updateBlogPost(editing.id, fd);
        setPosts(prev => prev.map(p => p.id === editing.id ? { ...p, ...r.data.data } : p));
        setMsg({ type: 'success', text: 'Post updated!' });
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
    if (!confirm('Delete this post permanently?')) return;
    setDeleting(id);
    try {
      await deleteBlogPost(id);
      setPosts(prev => prev.filter(p => p.id !== id));
      setMsg({ type: 'success', text: 'Post deleted' });
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
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditing(null)}
              className="text-gray-400 hover:text-gray-700 text-sm flex items-center gap-1.5 transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {editing === 'new' ? 'New Post' : 'Edit Post'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setField('status', 'draft')} disabled={saving}>
              Save as Draft
            </Button>
            <Button
              variant="primary" size="sm"
              loading={saving}
              onClick={() => handleSave('published')}
            >
              Publish
            </Button>
          </div>
        </div>

        {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setField('title', e.target.value)}
                  className="input w-full text-lg font-semibold"
                  placeholder="Post title…"
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

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <div className="card space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Publish Settings</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setField('status', e.target.value)}
                  className="input w-full text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <Button
                variant="primary" size="sm"
                className="w-full justify-center"
                loading={saving}
                onClick={() => handleSave()}
              >
                Save
              </Button>
            </div>

            {/* Cover image */}
            <div className="card space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">Cover Image</h3>
              {(coverFile || form.coverImage) && (
                <img
                  src={coverFile ? URL.createObjectURL(coverFile) : form.coverImage}
                  alt="Cover preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => setCoverFile(e.target.files[0] || null)}
                className="text-xs text-gray-600 w-full"
              />
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Or image URL</label>
                <input
                  value={coverFile ? '' : form.coverImage}
                  onChange={e => { setCoverFile(null); setField('coverImage', e.target.value); }}
                  className="input w-full text-sm"
                  placeholder="https://…"
                  disabled={!!coverFile}
                />
              </div>
            </div>

            {/* SEO */}
            <div className="card space-y-3">
              <h3 className="font-semibold text-gray-800 text-sm">SEO</h3>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta title</label>
                <input
                  value={form.metaTitle}
                  onChange={e => setField('metaTitle', e.target.value)}
                  className="input w-full text-sm"
                  placeholder="Auto-filled from title"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Meta description</label>
                <textarea
                  value={form.metaDescription}
                  onChange={e => setField('metaDescription', e.target.value)}
                  className="input w-full text-sm resize-none"
                  rows={3}
                  placeholder="160 chars max…"
                  maxLength={160}
                />
                <p className="text-xs text-gray-400 text-right mt-0.5">{form.metaDescription.length}/160</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={e => setField('tags', e.target.value)}
                  className="input w-full text-sm"
                  placeholder="images, compression, tips"
                />
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
          <h1 className="text-2xl font-bold text-gray-900">Blog Manager</h1>
          <p className="text-gray-500 text-sm">{posts.length} posts</p>
        </div>
        <Button variant="primary" size="sm" onClick={openNew}>+ New Post</Button>
      </div>

      {msg && <Alert type={msg.type} message={msg.text} onClose={() => setMsg(null)} />}

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading posts…" /></div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-4xl mb-3">✍️</p>
          <p className="text-gray-500">No blog posts yet.</p>
          <Button variant="primary" size="sm" className="mt-4" onClick={openNew}>Write first post</Button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Title</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Tags</th>
                <th className="text-center px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {posts.map((post, i) => (
                  <motion.tr
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800">{post.title}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(post.tags || []).slice(0, 3).map(t => (
                          <span key={t} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={post.status} /></td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs hidden md:table-cell">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEdit(post)}>Edit</Button>
                        <Button
                          size="sm" variant="danger"
                          loading={deleting === post.id}
                          onClick={() => handleDelete(post.id)}
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
