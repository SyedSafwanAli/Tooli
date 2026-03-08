import { useState, useCallback } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import { PdfPageCounterIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli PDF Page Counter instantly tells you how many pages are in any PDF file — without uploading it to a server. The file is read locally in your browser using the FileReader API and the page count is extracted from the PDF structure.',
  howTo: [
    'Click or drag your PDF file into the upload area.',
    'The page count appears instantly — no waiting, no upload.',
    'Upload a different file to check another PDF.',
  ],
  features: [
    'Instant page count from any PDF',
    '100% client-side — file never leaves your device',
    'Works with all PDF versions',
    'Shows file name and file size alongside page count',
    'No file size restrictions for counting',
    'No account or login required',
  ],
  faq: [
    { q: 'Is my PDF file uploaded to a server?', a: 'No. The PDF is read entirely in your browser using the FileReader API. Nothing is sent to any server.' },
    { q: 'What if the page count shows as unknown?', a: 'Some encrypted or malformed PDFs may not expose the page count in a readable location. Try opening the file in a PDF viewer to check.' },
    { q: 'Is there a file size limit?', a: 'No file size limit for counting. Larger files may take a second or two to read from disk, but the count itself is extracted from just a few bytes of metadata.' },
  ],
};

function countPdfPages(buffer) {
  const bytes = new Uint8Array(buffer);
  const decoder = new TextDecoder('latin1');
  // Decode in chunks to handle large files efficiently
  const chunkSize = 65536;
  let text = '';
  for (let i = 0; i < Math.min(bytes.length, 1024 * 1024); i += chunkSize) {
    text += decoder.decode(bytes.slice(i, i + chunkSize));
  }
  // Find /Count N entries — the largest is the total page count
  const matches = [...text.matchAll(/\/Count\s+(\d+)/g)];
  if (matches.length === 0) return null;
  return Math.max(...matches.map(m => parseInt(m[1], 10)));
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function PdfPageCounter() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useSEO({
    title: 'PDF Page Counter',
    description: 'Count the number of pages in any PDF instantly — no upload, no server, 100% browser-based.',
    keywords: ['pdf page counter', 'count pdf pages', 'how many pages in pdf', 'pdf page count', 'pdf pages online'],
    jsonLd: [
      buildToolSchema({ name: 'PDF Page Counter', description: 'Count pages in any PDF file locally in your browser', url: '/tools/pdf-page-counter' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/pdf-page-counter',
  });

  const handleFile = useCallback((file) => {
    setError('');
    setResult(null);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const count = countPdfPages(e.target.result);
        setResult({ name: file.name, size: file.size, pages: count });
      } catch {
        setError('Could not read this PDF file.');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => { setError('Failed to read file.'); setLoading(false); };
    reader.readAsArrayBuffer(file);
  }, []);

  return (
    <ToolLayout
      title="PDF Page Counter"
      description="Count the number of pages in any PDF instantly — no upload needed."
      icon={<PdfPageCounterIcon className="w-6 h-6" />}
      category="PDF"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        <FileUpload
          accept=".pdf,application/pdf"
          multiple={false}
          onFileSelect={handleFile}
          label="Click or drag a PDF file here"
          helpText="PDF files only — processed entirely in your browser"
          disabled={loading}
        />

        {loading && (
          <p className="text-sm text-gray-400 text-center py-2 animate-pulse">Reading PDF…</p>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        {result && !loading && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 p-5 text-center space-y-2">
            <div className="text-6xl font-bold text-blue-700 tabular-nums">
              {result.pages !== null ? result.pages : '?'}
            </div>
            <div className="text-sm font-semibold text-blue-500">
              {result.pages === 1 ? 'page' : 'pages'}
            </div>
            <div className="text-xs text-gray-400 pt-1">
              {result.name} · {formatBytes(result.size)}
            </div>
            {result.pages === null && (
              <p className="text-xs text-amber-600 pt-1">Could not determine page count from this PDF's structure.</p>
            )}
          </div>
        )}

        {!result && !loading && !error && (
          <p className="text-xs text-gray-400 text-center py-2">Upload a PDF to count its pages.</p>
        )}
      </div>
    </ToolLayout>
  );
}
