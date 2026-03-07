import { useState, useEffect } from 'react';
import { formatBytes } from '../../utils/formatters';

/**
 * Before/After image comparison panel for image tool result pages.
 * Props:
 *   originalFile  — File object (from upload)
 *   resultBlob    — Blob (from API response.data)
 *   originalSize  — number (bytes)
 *   resultSize    — number (bytes)
 *   savedPct      — string e.g. "62" (savings percentage)
 */
export default function ImageResultPreview({ originalFile, resultBlob, originalSize, resultSize, savedPct }) {
  const [originalUrl, setOriginalUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [view, setView] = useState('both'); // 'both' | 'before' | 'after'

  useEffect(() => {
    if (!originalFile) return;
    const url = URL.createObjectURL(originalFile);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [originalFile]);

  useEffect(() => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    setResultUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [resultBlob]);

  if (!originalUrl || !resultUrl) return null;

  const tabs = [
    { id: 'both',  label: 'Side by Side' },
    { id: 'before', label: 'Before' },
    { id: 'after',  label: 'After' },
  ];

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Preview</h3>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                view === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'both' && (
        <div className="grid grid-cols-2 gap-3">
          <PreviewPanel label="Before" size={originalSize} url={originalUrl} />
          <PreviewPanel label="After" size={resultSize} url={resultUrl} accent savedPct={savedPct} />
        </div>
      )}

      {view === 'before' && <PreviewPanel label="Before" size={originalSize} url={originalUrl} large />}
      {view === 'after'  && <PreviewPanel label="After"  size={resultSize}   url={resultUrl}  large accent savedPct={savedPct} />}
    </div>
  );
}

function PreviewPanel({ label, size, url, accent, savedPct, large }) {
  return (
    <div className={`rounded-xl overflow-hidden border ${accent ? 'border-green-200' : 'border-gray-200'}`}>
      <img
        src={url}
        alt={label}
        className={`w-full object-contain bg-gray-50 ${large ? 'max-h-96' : 'max-h-48'}`}
      />
      <div className={`px-3 py-2 flex items-center justify-between text-xs ${accent ? 'bg-green-50' : 'bg-gray-50'}`}>
        <span className={`font-semibold ${accent ? 'text-green-700' : 'text-gray-600'}`}>{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-gray-500">{formatBytes(size)}</span>
          {savedPct && (
            <span className="bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">
              -{savedPct}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
