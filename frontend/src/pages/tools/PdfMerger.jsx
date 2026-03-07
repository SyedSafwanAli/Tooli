import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { MergePdfIcon } from '../../components/common/Icons';
import { mergePdfs, downloadBlob } from '../../services/toolsApi';
import { formatBytes } from '../../utils/formatters';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli PDF Merger combines up to 10 PDF files into a single document while preserving all content, bookmarks, and formatting. It uses pdf-lib on the server to perform the merge with no quality loss.',
  howTo: [
    'Upload your PDF files using the drag-and-drop zone or the Browse button.',
    'Reorder files using the ↑ and ↓ arrows to set the page order in the merged PDF.',
    'Remove any unwanted files with the ✕ button.',
    'Click "Merge PDFs" once you have at least 2 files.',
    'Download the merged PDF using the button that appears.',
  ],
  features: [
    'Merge up to 10 PDF files at once',
    'Drag-and-drop file ordering',
    'Shows total page count of merged output',
    'Preserves all original content and formatting',
    'No file size limit per file (up to 10 MB each)',
    'Files deleted from server after processing',
  ],
  faq: [
    { q: 'Is there a page limit for the merged PDF?', a: 'There is no hard page limit. You can merge up to 10 PDF files, each up to 10 MB. Very large documents may take longer to process.' },
    { q: 'Will bookmarks and links be preserved?', a: 'The tool preserves all page content including text, images, and vector graphics. Complex interactive features like form fields may be flattened.' },
    { q: 'Can I change the order of pages after merging?', a: 'You can reorder entire files before merging using the arrows. For page-level reordering within a single document, use the PDF Splitter to extract pages first.' },
  ],
};

export default function PdfMerger() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useSEO({
    title: 'PDF Merger',
    description: 'Merge multiple PDF files into one online. Free, fast and secure.',
    keywords: ['pdf merger', 'merge pdf', 'combine pdf', 'join pdf files', 'pdf combiner'],
    jsonLd: [buildToolSchema({ name: 'PDF Merger', description: 'Merge multiple PDF files into one online for free', url: '/tools/merge-pdfs' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/merge-pdfs',
  });

  const addFiles = (newFiles) => {
    const arr = Array.isArray(newFiles) ? newFiles : [newFiles];
    setFiles(prev => {
      const combined = [...prev, ...arr];
      if (combined.length > 10) { setError('Maximum 10 files allowed'); return prev; }
      return combined;
    });
    setResult(null);
    setError('');
  };

  const removeFile = (idx) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const moveFile = (idx, dir) => {
    setFiles(prev => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setLoading(true);
    setError('');
    try {
      const res = await mergePdfs(files);
      const pageCount = parseInt(res.headers['x-page-count'] || 0);
      setResult({ blob: res, filename: 'merged.pdf', pageCount, size: res.data.size });
    } catch (err) {
      setError(err.response?.data?.message || 'Merge failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Merger"
      description="Combine up to 10 PDF files into one document."
      icon={<MergePdfIcon className="w-6 h-6" />}
      category="PDF"
      seoContent={seoContent}
    >
      <div className="card">
        <FileUpload
          accept=".pdf,application/pdf"
          multiple
          onFileSelect={addFiles}
          label="Click or drag PDF files here"
          helpText="Upload multiple PDFs — max 10 MB each, max 10 files"
          maxSize={10 * 1024 * 1024}
        />
      </div>

      {files.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">PDF Order ({files.length} files)</h3>
            <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:underline">Clear all</button>
          </div>

          <div className="space-y-2 mb-4">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-400 text-sm w-5 text-center">{i + 1}</span>
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

          <Button onClick={handleMerge} loading={loading} className="w-full" size="lg"
            disabled={files.length < 2}>
            {loading ? 'Merging...' : `Merge ${files.length} PDFs`}
          </Button>
          {files.length < 2 && <p className="text-xs text-gray-400 text-center mt-2">Add at least 2 PDF files</p>}
        </div>
      )}

      {error && <Alert type="error" message={error} />}

      {result && (
        <div className="card bg-green-50 border-2 border-green-100">
          <p className="font-bold text-green-800 mb-1">✅ Merged successfully!</p>
          <p className="text-sm text-green-700 mb-3">
            {result.pageCount} pages — {formatBytes(result.size)}
          </p>
          <Button onClick={() => downloadBlob(result.blob, result.filename)} className="w-full">
            ⬇ Download Merged PDF
          </Button>
        </div>
      )}
    </ToolLayout>
  );
}
