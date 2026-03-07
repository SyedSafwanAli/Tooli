import api from './api';

export const login = (username, password) => api.post('/admin/login', { username, password });
export const getMe = () => api.get('/admin/me');
export const changePassword = (currentPassword, newPassword) =>
  api.put('/admin/password', { currentPassword, newPassword });

export const getAnalyticsSummary = (days = 30) => api.get(`/admin/analytics/summary?days=${days}`);
export const getAllAnalytics = () => api.get('/admin/analytics');
export const clearAnalytics = () => api.delete('/admin/analytics');

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
