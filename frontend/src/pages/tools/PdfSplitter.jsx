import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { SplitPdfIcon } from '../../components/common/Icons';
import { splitPdf, downloadBlob } from '../../services/toolsApi';
import { formatBytes } from '../../utils/formatters';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli PDF Splitter extracts one or more pages from a PDF file. You can specify exact page numbers and ranges. When splitting all pages, the tool returns a ZIP archive with one PDF file per page.',
  howTo: [
    'Upload your PDF using the drag-and-drop zone.',
    'Optionally enter a page range (e.g. "1,3,5-7"). Leave blank to split every page.',
    'Click "Split PDF" to process the file.',
    'Download the resulting PDF page or ZIP archive.',
  ],
  features: [
    'Extract specific pages by number',
    'Supports ranges like "5-10"',
    'Mix individual pages and ranges: "1,3,5-7"',
    'Full split returns a ZIP with one PDF per page',
    'Max 10 MB PDF input',
    'Server-side processing with pdf-lib',
  ],
  faq: [
    { q: 'What format should I enter the page range?', a: 'Use commas to separate individual pages (1,3,5) and hyphens for ranges (5-10). You can combine both: "1,3,5-7" extracts pages 1, 3, 5, 6, and 7.' },
    { q: 'What happens if I leave the range blank?', a: 'All pages are extracted individually and returned as a ZIP archive, with one PDF file per page named page-1.pdf, page-2.pdf, etc.' },
    { q: 'Will the quality of the extracted pages be affected?', a: 'No. pdf-lib extracts pages without re-encoding, so there is no quality loss.' },
  ],
};

export default function PdfSplitter() {
  const [file, setFile] = useState(null);
  const [pageRange, setPageRange] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useSEO({
    title: 'PDF Splitter',
    description: 'Split PDF into individual pages or extract a page range. Free and instant.',
    keywords: ['pdf splitter', 'split pdf', 'extract pdf pages', 'pdf page extractor'],
    jsonLd: [buildToolSchema({ name: 'PDF Splitter', description: 'Split PDF into individual pages or extract a page range', url: '/tools/split-pdf' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/split-pdf',
  });

  const handleFile = (f) => { setFile(f); setResult(null); setError(''); };

  const handleSplit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await splitPdf(file, pageRange || undefined);
      const isZip = res.headers['content-type']?.includes('zip');
      setResult({
        blob: res,
        filename: isZip ? 'split-pages.zip' : 'page.pdf',
        isZip,
        size: res.data.size,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Split failed. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Splitter"
      description="Split a PDF into individual pages or extract a specific range."
      icon={<SplitPdfIcon className="w-6 h-6" />}
      category="PDF"
      seoContent={seoContent}
    >
      <div className="card">
        <FileUpload
          accept=".pdf,application/pdf"
          onFileSelect={handleFile}
          label="Click or drag PDF here"
          helpText="Max 10 MB"
          maxSize={10 * 1024 * 1024}
        />
        {file && <p className="mt-3 text-sm text-gray-500">{file.name} — {formatBytes(file.size)}</p>}
      </div>

      {file && (
        <div className="card space-y-4">
          <div>
            <label className="label">Page Range (optional)</label>
            <input
              type="text"
              className="input"
              value={pageRange}
              onChange={e => setPageRange(e.target.value)}
              placeholder='e.g. "1,3,5-7" or leave blank to split all pages'
            />
            <p className="text-xs text-gray-400 mt-1">
              Examples: <code>1,3</code> · <code>5-10</code> · <code>1,3,5-7</code>
              <br />Leave blank to extract all pages (returns a ZIP with one PDF per page)
            </p>
          </div>

          <Button onClick={handleSplit} loading={loading} className="w-full" size="lg">
            {loading ? 'Splitting...' : 'Split PDF'}
          </Button>
        </div>
      )}

      {error && <Alert type="error" message={error} />}

      {result && (
        <div className="card bg-green-50 border-2 border-green-100">
          <p className="font-bold text-green-800 mb-1">✅ Split complete!</p>
          <p className="text-sm text-green-700 mb-3">
            {result.isZip ? 'Multiple pages — downloaded as ZIP' : 'Single page PDF'} · {formatBytes(result.size)}
          </p>
          <Button onClick={() => downloadBlob(result.blob, result.filename)} className="w-full">
            ⬇ Download {result.isZip ? 'ZIP Archive' : 'PDF Page'}
          </Button>
        </div>
      )}
    </ToolLayout>
  );
}
