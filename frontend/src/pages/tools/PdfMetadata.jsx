import { useState, useCallback } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import { PdfMetadataIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli PDF Metadata Viewer extracts embedded metadata from any PDF file — including title, author, subject, keywords, creator application, producer, creation date, and modification date. All processing happens locally in your browser.',
  howTo: [
    'Click or drag a PDF file into the upload area.',
    'Metadata fields are extracted and displayed instantly.',
    'Use the copy buttons to copy individual field values.',
  ],
  features: [
    'Extracts title, author, subject, keywords',
    'Shows creator app and PDF producer',
    'Displays creation and modification dates',
    'Shows PDF version and file size',
    '100% client-side — file never leaves your browser',
    'Works with any PDF version',
  ],
  faq: [
    { q: 'What metadata can PDFs contain?', a: 'PDF files can embed title, author, subject, keywords, creator (the software that created the document), producer (the PDF library used), creation date, and modification date.' },
    { q: 'Why are some fields empty?', a: 'Not all PDFs have metadata set. Many PDFs are created without title or author information. Scanned PDFs often have no metadata at all.' },
    { q: 'Is my PDF uploaded anywhere?', a: 'No. The PDF is read entirely in your browser. Nothing is sent to any server.' },
  ],
};

function parsePdfDate(raw) {
  if (!raw) return null;
  // PDF date format: D:YYYYMMDDHHmmSSOHH'mm'
  const m = raw.replace(/^D:/, '').match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
  if (!m) return raw;
  const [, y, mo, d, h, min, s] = m;
  return `${y}-${mo}-${d} ${h}:${min}:${s}`;
}

function extractPdfMetadata(buffer) {
  const decoder = new TextDecoder('latin1');
  const maxRead = Math.min(buffer.byteLength, 2 * 1024 * 1024);
  const text = decoder.decode(new Uint8Array(buffer, 0, maxRead));

  const getString = (field) => {
    // Literal string: /Field (value)
    let m = text.match(new RegExp(`/${field}\\s*\\(([^)\\\\]*(?:\\\\.[^)\\\\]*)*)\\)`));
    if (m) return m[1].replace(/\\([()\\])/g, '$1').trim();
    // Hex string: /Field <hex>
    m = text.match(new RegExp(`/${field}\\s*<([A-Fa-f0-9\\s]+)>`));
    if (m) {
      const hex = m[1].replace(/\s/g, '');
      // Detect UTF-16 BE (starts with FEFF)
      if (hex.startsWith('feff') || hex.startsWith('FEFF')) {
        const bytes = [];
        for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
        return new TextDecoder('utf-16be').decode(new Uint8Array(bytes.slice(2))).trim();
      }
      // ASCII hex
      let str = '';
      for (let i = 0; i < hex.length; i += 2) str += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
      return str.trim();
    }
    return null;
  };

  // PDF version from header
  const verM = text.match(/%PDF-(\d+\.\d+)/);

  return {
    version:      verM ? verM[1] : null,
    title:        getString('Title'),
    author:       getString('Author'),
    subject:      getString('Subject'),
    keywords:     getString('Keywords'),
    creator:      getString('Creator'),
    producer:     getString('Producer'),
    creationDate: parsePdfDate(getString('CreationDate')),
    modDate:      parsePdfDate(getString('ModDate')),
  };
}

function formatBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

const FIELDS = [
  { key: 'version',      label: 'PDF Version' },
  { key: 'title',        label: 'Title' },
  { key: 'author',       label: 'Author' },
  { key: 'subject',      label: 'Subject' },
  { key: 'keywords',     label: 'Keywords' },
  { key: 'creator',      label: 'Creator Application' },
  { key: 'producer',     label: 'PDF Producer' },
  { key: 'creationDate', label: 'Creation Date' },
  { key: 'modDate',      label: 'Modified Date' },
];

export default function PdfMetadata() {
  const [meta, setMeta]     = useState(null);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState('');

  useSEO({
    title: 'PDF Metadata Viewer',
    description: 'View PDF metadata: title, author, creation date, producer, and more. Instant, browser-based — no file upload.',
    keywords: ['pdf metadata viewer', 'pdf properties', 'pdf author', 'pdf creation date', 'view pdf metadata'],
    jsonLd: [
      buildToolSchema({ name: 'PDF Metadata Viewer', description: 'Extract and view metadata from any PDF file locally', url: '/tools/pdf-metadata' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/pdf-metadata',
  });

  const handleFile = useCallback((file) => {
    setError('');
    setMeta(null);
    setFileName(file.name);
    setFileSize(file.size);
    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        setMeta(extractPdfMetadata(e.target.result));
      } catch {
        setError('Could not read metadata from this file.');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => { setError('Failed to read file.'); setLoading(false); };
    reader.readAsArrayBuffer(file);
  }, []);

  const copyField = (key, value) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const filledFields = meta ? FIELDS.filter(f => meta[f.key]) : [];
  const emptyFields  = meta ? FIELDS.filter(f => !meta[f.key]) : [];

  return (
    <ToolLayout
      title="PDF Metadata Viewer"
      description="View title, author, creation date, and all embedded properties of any PDF file."
      icon={<PdfMetadataIcon className="w-6 h-6" />}
      category="PDF"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        <FileUpload
          accept=".pdf,application/pdf"
          multiple={false}
          onFileSelect={handleFile}
          label="Click or drag a PDF file here"
          helpText="PDF files only — metadata extracted in your browser"
          disabled={loading}
        />

        {loading && <p className="text-sm text-gray-400 text-center py-2 animate-pulse">Extracting metadata…</p>}
        {error && <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}

        {meta && !loading && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">{fileName} · {formatBytes(fileSize)}</p>

            {filledFields.length > 0 && (
              <div className="divide-y divide-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                {filledFields.map(({ key, label }) => (
                  <div key={key} className="flex items-start gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-sm text-gray-800 font-medium break-words">{meta[key]}</p>
                    </div>
                    <button
                      onClick={() => copyField(key, meta[key])}
                      className="text-xs text-gray-300 group-hover:text-blue-500 transition-colors shrink-0 mt-3"
                    >
                      {copied === key ? '✓' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {emptyFields.length > 0 && (
              <p className="text-xs text-gray-400">
                Not set: {emptyFields.map(f => f.label).join(', ')}
              </p>
            )}

            {filledFields.length === 0 && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-600 text-center">
                No metadata found in this PDF.
              </div>
            )}
          </div>
        )}

        {!meta && !loading && !error && (
          <p className="text-xs text-gray-400 text-center py-2">Upload a PDF to view its metadata.</p>
        )}
      </div>
    </ToolLayout>
  );
}
