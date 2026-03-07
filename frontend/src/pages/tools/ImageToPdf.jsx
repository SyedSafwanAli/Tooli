import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { ImageToPdfIcon } from '../../components/common/Icons';
import { imagesToPdf, downloadBlob } from '../../services/toolsApi';
import { formatBytes } from '../../utils/formatters';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Image to PDF converter turns one or more JPG, PNG, or WebP images into a single PDF document. Each image becomes one page. You can reorder images before converting to control the page order in the output PDF.',
  howTo: [
    'Upload your images using the drag-and-drop zone. You can select multiple at once.',
    'Reorder the images using the ↑ and ↓ arrows — this sets the page order.',
    'Remove any unwanted images using the ✕ button.',
    'Click "Convert to PDF" and download the resulting document.',
  ],
  features: [
    'Convert JPG, PNG, or WebP to PDF',
    'Multiple images produce a multi-page PDF',
    'Drag-and-drop page ordering',
    'Thumbnail previews for each image',
    'Up to 10 images per conversion',
    'Server-side processing with pdf-lib',
  ],
  faq: [
    { q: 'What image formats are supported?', a: 'You can upload JPG, PNG, and WebP images. Each image becomes one page in the output PDF.' },
    { q: 'Will the images be scaled to fit the page?', a: 'Yes. Each image is scaled to fill a standard A4-sized page while maintaining its aspect ratio.' },
    { q: 'Can I convert a single image to PDF?', a: 'Yes. You can upload just one image and the tool will produce a single-page PDF.' },
  ],
};

export default function ImageToPdf() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useSEO({
    title: 'Image to PDF',
    description: 'Convert JPG, PNG, or WebP images to PDF. Multiple images become a multi-page PDF.',
    keywords: ['image to pdf', 'jpg to pdf', 'png to pdf', 'convert image pdf', 'photos to pdf'],
    jsonLd: [buildToolSchema({ name: 'Image to PDF Converter', description: 'Convert images to PDF online for free', url: '/tools/image-to-pdf' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/image-to-pdf',
  });

  const addFiles = (newFiles) => {
    const arr = Array.isArray(newFiles) ? newFiles : [newFiles];
    setFiles(prev => [...prev, ...arr].slice(0, 10));
    setResult(null);
    setError('');
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));
  const moveFile = (idx, dir) => {
    setFiles(prev => {
      const arr = [...prev];
      const t = idx + dir;
      if (t < 0 || t >= arr.length) return arr;
      [arr[idx], arr[t]] = [arr[t], arr[idx]];
      return arr;
    });
  };

  const handleConvert = async () => {
    if (!files.length) return;
    setLoading(true);
    setError('');
    try {
      const res = await imagesToPdf(files);
      const pageCount = parseInt(res.headers['x-page-count'] || files.length);
      setResult({ blob: res, filename: 'images.pdf', pageCount, size: res.data.size });
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert one or multiple images into a single PDF document. Reorder as needed."
      icon={<ImageToPdfIcon className="w-6 h-6" />}
      category="PDF"
      seoContent={seoContent}
    >
      <div className="card">
        <FileUpload
          accept="image/*"
          multiple
          onFileSelect={addFiles}
          label="Click or drag images here"
          helpText="JPG, PNG, WebP — each max 10 MB, up to 10 images"
          maxSize={10 * 1024 * 1024}
        />
      </div>

      {files.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Images ({files.length})</h3>
            <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:underline">Clear all</button>
          </div>

          <div className="space-y-2 mb-4">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img src={URL.createObjectURL(f)} alt={f.name} className="h-10 w-10 object-cover rounded" />
                <span className="flex-1 text-sm text-gray-700 truncate">{f.name}</span>
                <span className="text-xs text-gray-400">{formatBytes(f.size)}</span>
                <div className="flex gap-1">
                  <button onClick={() => moveFile(i, -1)} disabled={i === 0}
                    className="w-6 h-6 text-gray-400 hover:text-blue-600 disabled:opacity-30 text-xs">↑</button>
                  <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}
                    className="w-6 h-6 text-gray-400 hover:text-blue-600 disabled:opacity-30 text-xs">↓</button>
                  <button onClick={() => removeFile(i)}
                    className="w-6 h-6 text-gray-400 hover:text-red-500 text-xs">✕</button>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleConvert} loading={loading} className="w-full" size="lg">
            {loading ? 'Converting...' : `Convert ${files.length} Image${files.length > 1 ? 's' : ''} to PDF`}
          </Button>
        </div>
      )}

      {error && <Alert type="error" message={error} />}

      {result && (
        <div className="card bg-green-50 border-2 border-green-100">
          <p className="font-bold text-green-800 mb-1">✅ PDF created!</p>
          <p className="text-sm text-green-700 mb-3">{result.pageCount} pages — {formatBytes(result.size)}</p>
          <Button onClick={() => downloadBlob(result.blob, result.filename)} className="w-full">
            ⬇ Download PDF
          </Button>
        </div>
      )}
    </ToolLayout>
  );
}
