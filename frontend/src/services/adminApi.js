import api from './api';

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (username, password) => api.post('/admin/login', { username, password });
export const getMe = () => api.get('/admin/me');
export const changePassword = (currentPassword, newPassword) =>
  api.put('/admin/password', { currentPassword, newPassword });

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getAnalyticsSummary = (days = 30) => api.get(`/admin/analytics/summary?days=${days}`);
export const getAllAnalytics = () => api.get('/admin/analytics');
export const clearAnalytics = () => api.delete('/admin/analytics');

// ── AI Insights ───────────────────────────────────────────────────────────────
export const getAIInsights = (days = 30) => api.get(`/admin/insights?days=${days}`);
export const getUserStats   = ()          => api.get('/admin/insights/users');

// ── Revenue ───────────────────────────────────────────────────────────────────
export const getRevenue = () => api.get('/admin/revenue');
export const addRevenue = (data) => api.post('/admin/revenue', data);
export const updateRevenue = (id, data) => api.put(`/admin/revenue/${id}`, data);
export const deleteRevenue = (id) => api.delete(`/admin/revenue/${id}`);
export const getRevenueSummary = (year, month) => {
  const params = new URLSearchParams();
  if (year) params.set('year', year);
  if (month) params.set('month', month);
  return api.get(`/admin/revenue/summary?${params}`);
};
export const getRevenueCategories = () => api.get('/admin/revenue/categories');

// ── System health ─────────────────────────────────────────────────────────────
export const getSystemHealth = () => api.get('/admin/system');

// ── Tool overrides ────────────────────────────────────────────────────────────
export const getToolOverrides    = ()          => api.get('/admin/tools');
export const updateToolOverride  = (id, data)  => api.put(`/admin/tools/${id}`, data);
export const deleteToolOverride  = (id)        => api.delete(`/admin/tools/${id}`);

// ── File processing logs ──────────────────────────────────────────────────────
export const getLogs    = () => api.get('/admin/logs');
export const clearLogs  = () => api.delete('/admin/logs');

// ── SEO meta ─────────────────────────────────────────────────────────────────
export const getSeoMeta    = ()                           => api.get('/admin/seo');
export const updateSeoMeta = (path, title, description)   =>
  api.post('/admin/seo', { path, title, description });
export const deleteSeoMeta = (path) =>
  api.delete(`/admin/seo/${encodeURIComponent(path)}`);

// ── Blog (admin) ──────────────────────────────────────────────────────────────
export const getBlogPosts   = ()          => api.get('/admin/blog');
export const getBlogPost    = (id)        => api.get(`/admin/blog/${id}`);
export const createBlogPost = (formData)  =>
  api.post('/admin/blog', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateBlogPost = (id, formData) =>
  api.put(`/admin/blog/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteBlogPost = (id) => api.delete(`/admin/blog/${id}`);

// ── Guides (admin) ────────────────────────────────────────────────────────────
export const getAdminGuides = ()          => api.get('/admin/guides');
export const getAdminGuide  = (id)        => api.get(`/admin/guides/${id}`);
export const createGuide    = (data)      => api.post('/admin/guides', data);
export const updateGuide    = (id, data)  => api.put(`/admin/guides/${id}`, data);
export const deleteGuide    = (id)        => api.delete(`/admin/guides/${id}`);
