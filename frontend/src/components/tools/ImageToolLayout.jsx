import { useRef, useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ToolLayout from '../common/ToolLayout';
import ImageEditor from '../editor/ImageEditor';
import CanvasToolbar from '../editor/CanvasToolbar';
import FilterControls from '../editor/FilterControls';
import DownloadPanel from '../editor/DownloadPanel';

const DEFAULT_FILTERS = {
  brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false,
};

function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * ImageToolLayout wraps every image tool page.
 *
 * Props:
 *  title, description, icon, category, seoContent  — passed through to ToolLayout
 *  acceptedTypes  — e.g. "image/*"  (default)
 *  maxFiles       — default 1
 *  showEditor     — show fabric.js canvas editor (default true)
 *  showFilters    — show filter sliders (default true)
 *  controlsSlot   — JSX rendered in the "Settings" panel (tool-specific controls)
 *  onProcess      — async fn(file, filters) → { blob, originalSize, resultSize, savedPct }
 *  processLabel   — button text
 *  downloadName   — base name for downloaded file (no extension)
 */
export default function ImageToolLayout({
  title, description, icon, category, seoContent,
  acceptedTypes = 'image/*',
  maxFiles = 1,
  showEditor = true,
  showFilters = true,
  controlsSlot,
  onProcess,
  processLabel = 'Process Image',
  downloadName = 'result',
  children,
}) {
  const editorRef = useRef(null);
  const [file, setFile]       = useState(null);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [result, setResult]   = useState(null);

  // Stable object URLs — revoked when file/result changes
  const [previewUrl, setPreviewUrl]   = useState(null);
  const [resultUrl, setResultUrl]     = useState(null);

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!result?.blob) { setResultUrl(null); return; }
    const url = URL.createObjectURL(result.blob);
    setResultUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  // ── Dropzone ─────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    if (!accepted.length) return;
    setFile(accepted[0]);
    setResult(null);
    setError('');
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles,
    multiple: maxFiles > 1,
  });

  // ── Toolbar actions ───────────────────────────────────────────────────────
  function handleToolbarAction(action) {
    const ed = editorRef.current;
    if (!ed) return;
    switch (action) {
      case 'rotateLeft':  ed.rotateLeft();  break;
      case 'rotateRight': ed.rotateRight(); break;
      case 'flipH':       ed.flipH();       break;
      case 'flipV':       ed.flipV();       break;
      case 'zoomIn':      ed.zoomIn();      break;
      case 'zoomOut':     ed.zoomOut();     break;
      case 'resetView':   ed.resetView();   break;
      case 'resetAll':
        ed.resetAll();
        setFilters({ ...DEFAULT_FILTERS });
        setResult(null);
        break;
    }
  }

  // ── Filter change ─────────────────────────────────────────────────────────
  function handleFilterChange(key, value) {
    if (key === 'reset') {
      setFilters({ ...DEFAULT_FILTERS });
      editorRef.current?.updateFilter('reset', null);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
      editorRef.current?.updateFilter(key, value);
    }
    setResult(null);
  }

  // ── Process ───────────────────────────────────────────────────────────────
  async function handleProcess() {
    if (!file || !onProcess) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await onProcess(file, filters, editorRef.current);
      setResult(res);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Processing failed.');
    } finally {
      setLoading(false);
    }
  }

  const hasFile = Boolean(file);
  const hasResult = Boolean(result?.blob);
  const savedPct = result?.savedPct ?? 0;

  return (
    <ToolLayout title={title} description={description} icon={icon} category={category} seoContent={seoContent}>

      {/* ── Upload Zone ──────────────────────────────────────────────────── */}
      <div
        {...getRootProps()}
        className={`card flex flex-col items-center justify-center gap-3 py-10 border-2 border-dashed cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {isDragActive ? (
          <p className="text-blue-500 font-medium text-sm">Drop image here…</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium text-sm">
              {hasFile ? file.name : 'Click or drag an image here'}
            </p>
            <p className="text-gray-400 text-xs">Supports JPG, PNG, WebP, AVIF, GIF</p>
          </>
        )}
        {hasFile && !isDragActive && (
          <span className="text-xs text-blue-500 underline">Change image</span>
        )}
      </div>

      {/* ── Editor + Controls ─────────────────────────────────────────────── */}
      {hasFile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Canvas editor — 2/3 width */}
          {showEditor && (
            <div className="lg:col-span-2 space-y-2">
              <CanvasToolbar onAction={handleToolbarAction} disabled={loading} />
              <ImageEditor ref={editorRef} imageFile={file} />
            </div>
          )}

          {/* Right sidebar — controls */}
          <div className={`space-y-4 ${!showEditor ? 'lg:col-span-3' : ''}`}>
            {/* Tool-specific controls */}
            {controlsSlot && (
              <div className="card space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Settings</p>
                {controlsSlot}
              </div>
            )}

            {/* Filter sliders */}
            {showFilters && (
              <div className="card">
                <FilterControls filters={filters} onChange={handleFilterChange} disabled={loading} />
              </div>
            )}

            {/* Process button */}
            {onProcess && (
              <button
                onClick={handleProcess}
                disabled={loading || !hasFile}
                className="w-full btn btn-primary py-3 text-sm font-semibold disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : processLabel}
              </button>
            )}

            {/* Download panel */}
            {hasResult && (
              <div className="card space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Download</p>
                {savedPct > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    Saved {savedPct}% · {fmtSize(result.originalSize)} → {fmtSize(result.resultSize)}
                  </p>
                )}
                {result.dimensions && (
                  <p className="text-sm text-blue-600 font-medium">{result.dimensions}</p>
                )}
                <DownloadPanel
                  getBlob={async (fmt, q) => {
                    if (fmt === 'png' || fmt === result.format) return result.blob;
                    return editorRef.current?.getBlob(fmt, q) ?? result.blob;
                  }}
                  originalName={file?.name ?? downloadName}
                  disabled={false}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card border border-red-200 bg-red-50 text-red-700 text-sm py-3 px-4">
          {error}
        </div>
      )}

      {/* ── Before / After Preview ────────────────────────────────────────── */}
      {!showEditor && hasFile && (
        <div className="card space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {hasResult ? 'Before / After' : 'Preview'}
          </p>
          <div className={`grid gap-4 ${hasResult ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {/* Before (original) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Original</span>
                <span className="text-[11px] text-gray-400">{fmtSize(file.size)}</span>
              </div>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Original"
                  className="w-full rounded-xl object-contain max-h-64 bg-gray-50 border border-gray-100"
                />
              )}
              <p className="text-[11px] text-gray-400 truncate">{file.name}</p>
            </div>

            {/* After (result) */}
            {hasResult && resultUrl && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Result</span>
                  <span className={`text-[11px] font-semibold ${savedPct > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                    {fmtSize(result.resultSize)}{savedPct > 0 ? ` (−${savedPct}%)` : ''}
                  </span>
                </div>
                <img
                  src={resultUrl}
                  alt="Result"
                  className="w-full rounded-xl object-contain max-h-64 bg-gray-50 border border-gray-100"
                />
                {result.dimensions && (
                  <p className="text-[11px] text-blue-500 font-medium">{result.dimensions}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom children slot */}
      {children}
    </ToolLayout>
  );
}
