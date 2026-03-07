import api from './api';

/**
 * All tool API calls that hit the backend.
 * Tools that work purely in the browser don't need any API call.
 */

function buildFormData(fields) {
  const fd = new FormData();
  for (const [key, val] of Object.entries(fields)) {
    if (val !== undefined && val !== null) {
      fd.append(key, val);
    }
  }
  return fd;
}

export const compressImage = (file, quality = 80, format) => {
  const fd = buildFormData({ image: file, quality, format });
  return api.post('/tools/compress-image', fd, { responseType: 'blob' });
};

export const resizeImage = (file, { width, height, fit = 'cover', format } = {}) => {
  const fd = buildFormData({ image: file, width, height, fit, format });
  return api.post('/tools/resize-image', fd, { responseType: 'blob' });
};

export const convertImage = (file, format, quality = 90) => {
  const fd = buildFormData({ image: file, format, quality });
  return api.post('/tools/convert-image', fd, { responseType: 'blob' });
};

export const mergePdfs = (files) => {
  const fd = new FormData();
  files.forEach(f => fd.append('pdfs', f));
  return api.post('/tools/merge-pdfs', fd, { responseType: 'blob' });
};

export const splitPdf = (file, pages) => {
  const fd = buildFormData({ pdf: file, pages });
  return api.post('/tools/split-pdf', fd, { responseType: 'blob' });
};

export const imagesToPdf = (files) => {
  const fd = new FormData();
  files.forEach(f => fd.append('images', f));
  return api.post('/tools/image-to-pdf', fd, { responseType: 'blob' });
};

// Page view tracking
export const trackPageView = (path) => {
  return api.post('/track', { path }).catch(() => {}); // silent fail
};

// Helper: trigger browser download from blob response
export function downloadBlob(response, filename) {
  const url = URL.createObjectURL(response.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Helper: get file size from blob response headers
export function getFileSizes(response) {
  return {
    original: parseInt(response.headers['x-original-size'] || 0),
    output: parseInt(response.headers['x-compressed-size'] || response.headers['x-output-size'] || 0),
    width: parseInt(response.headers['x-width'] || 0),
    height: parseInt(response.headers['x-height'] || 0),
    pageCount: parseInt(response.headers['x-page-count'] || 0),
  };
}
