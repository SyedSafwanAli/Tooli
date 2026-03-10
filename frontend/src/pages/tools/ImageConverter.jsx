import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import ToolLayout from '../../components/common/ToolLayout';
import ImageEditor from '../../components/editor/ImageEditor';
import CanvasToolbar from '../../components/editor/CanvasToolbar';
import FilterControls from '../../components/editor/FilterControls';
import { ConvertImageIcon } from '../../components/common/Icons';
import { convertImage } from '../../services/toolsApi';
import { formatBytes } from '../../utils/formatters';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

// ── Constants ──────────────────────────────────────────────────────────────────
const MAX_FILES = 50;

const OUTPUT_FORMATS = [
  { value: 'jpeg', label: 'JPEG', ext: 'jpg',  lossy: true,  desc: 'Best for photos. Smallest lossy file.' },
  { value: 'png',  label: 'PNG',  ext: 'png',  lossy: false, desc: 'Lossless. Supports transparency.' },
  { value: 'webp', label: 'WebP', ext: 'webp', lossy: true,  desc: '25–35% smaller than JPEG. Modern standard.' },
  { value: 'avif', label: 'AVIF', ext: 'avif', lossy: true,  desc: 'Next-gen. Best compression, slower encoding.' },
  { value: 'tiff', label: 'TIFF', ext: 'tiff', lossy: false, desc: 'Professional / print quality lossless.' },
  { value: 'gif',  label: 'GIF',  ext: 'gif',  lossy: false, desc: 'Animated or static indexed color.' },
];

const FIT_MODES = [
  { value: 'inside',  label: 'Fit inside (no crop)' },
  { value: 'cover',   label: 'Cover (crop to fill)' },
  { value: 'contain', label: 'Contain (letterbox)' },
  { value: 'fill',    label: 'Fill (stretch)' },
];

const DEFAULT_FILTERS = { brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false };

// ── Entry factory ──────────────────────────────────────────────────────────────
let _id = 0;
function makeEntry(file) {
  return {
    id:         ++_id,
    file,
    stem:       file.name.replace(/\.[^.]+$/, ''),
    format:     'webp',
    quality:    90,
    width:      '',
    height:     '',
    fit:        'inside',
    rotate:     0,
    flipH:      false,
    flipV:      false,
    editedFile: null,
    status:     'idle',
    blob:       null,
    error:      '',
    outW:       0,
    outH:       0,
  };
}

const seoContent = {
  about: 'The Tooli Image Converter is a professional batch image conversion platform. Convert dozens of images at once between JPEG, PNG, WebP, AVIF, TIFF, and GIF. Per-file format, quality, resize, rotate, and flip controls. Built-in fabric.js editor for color adjustments.',
  howTo: [
    'Drag and drop multiple images (up to 50 files).',
    'Set a global format/quality or expand each file for per-file settings.',
    'Optionally open the built-in editor to adjust colors, rotate, or flip.',
    'Click "Convert All" then download individually or as a ZIP.',
  ],
  features: [
    'Batch convert up to 50 images at once',
    'Per-file: format, quality, resize, rotate, flip',
    'Built-in editor with fabric.js canvas and color filters',
    'Rename each output file before downloading',
    'Download all results as a single ZIP',
    'Output: JPEG, PNG, WebP, AVIF, TIFF, GIF',
  ],
  faq: [
    { q: 'Why convert to WebP?', a: 'WebP produces 25–35% smaller files than JPEG at the same quality.' },
    { q: 'What is AVIF?', a: 'AVIF offers even better compression than WebP and supports HDR.' },
    { q: 'Can I resize while converting?', a: 'Yes — expand per-file settings, enter Width and/or Height, and the image is resized as part of conversion.' },
  ],
};

export default function ImageConverter() {
  const [entries,       setEntries]       = useState([]);
  const [globalFormat,  setGlobalFormat]  = useState('webp');
  const [globalQuality, setGlobalQuality] = useState(90);
  const [expanded,      setExpanded]      = useState(null);
  const [converting,    setConverting]    = useState(false);
  const [zipBusy,       setZipBusy]       = useState(false);
  const [editorModal,   setEditorModal]   = useState(null);
  const [editorFilters, setEditorFilters] = useState({ ...DEFAULT_FILTERS });
  const [preview,       setPreview]       = useState(null);
  const editorRef = useRef(null);

  useSEO({
    title: 'Image Converter — Batch Convert with Editor',
    description: 'Batch convert JPEG, PNG, WebP, AVIF, TIFF, GIF. Resize, rotate, flip per file. Built-in editor. Free.',
    keywords: ['image converter', 'batch image convert', 'convert jpg to webp', 'webp converter', 'avif converter'],
    jsonLd: [
      buildToolSchema({ name: 'Image Format Converter', description: 'Batch convert images with editor', url: '/tools/convert-image' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/convert-image',
  });

  // ── Dropzone ─────────────────────────────────────────────────────────────────
  const onDrop = useCallback((accepted) => {
    setEntries(prev => {
      const existing = new Set(prev.map(e => e.file.name));
      const fresh = accepted
        .filter(f => !existing.has(f.name))
        .slice(0, MAX_FILES - prev.length)
        .map(makeEntry);
      return [...prev, ...fresh];
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, multiple: true,
  });

  // ── Entry helpers ─────────────────────────────────────────────────────────────
  const upd = (id, patch) =>
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));

  const applyGlobal = () =>
    setEntries(prev => prev.map(e => ({ ...e, format: globalFormat, quality: globalQuality })));

  // ── Convert ───────────────────────────────────────────────────────────────────
  const convertOne = async (entry) => {
    upd(entry.id, { status: 'converting', blob: null, error: '' });
    try {
      const src = entry.editedFile || entry.file;
      const res = await convertImage(src, entry.format, entry.quality, {
        width:  entry.width  || undefined,
        height: entry.height || undefined,
        fit:    entry.fit,
        rotate: entry.rotate || undefined,
        flipH:  entry.flipH  || undefined,
        flipV:  entry.flipV  || undefined,
      });
      upd(entry.id, {
        status: 'done',
        blob:   res.data,
        outW:   parseInt(res.headers['x-width']  || 0),
        outH:   parseInt(res.headers['x-height'] || 0),
      });
    } catch (err) {
      upd(entry.id, {
        status: 'error',
        error:  err.response?.data?.message || 'Conversion failed — check format compatibility.',
      });
    }
  };

  const handleConvertAll = async () => {
    const pending = entries.filter(e => e.status !== 'done');
    if (!pending.length) return;
    setConverting(true);
    for (const e of pending) await convertOne(e);
    setConverting(false);
  };

  // ── Download ──────────────────────────────────────────────────────────────────
  const dlOne = (entry) => {
    const fmt = OUTPUT_FORMATS.find(f => f.value === entry.format);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(entry.blob);
    a.download = `${entry.stem}.${fmt?.ext || entry.format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const dlZip = async () => {
    const done = entries.filter(e => e.status === 'done');
    if (!done.length) return;
    setZipBusy(true);
    const zip = new JSZip();
    done.forEach(e => {
      const fmt = OUTPUT_FORMATS.find(f => f.value === e.format);
      zip.file(`${e.stem}.${fmt?.ext || e.format}`, e.blob);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'converted-images.zip';
    a.click();
    URL.revokeObjectURL(a.href);
    setZipBusy(false);
  };

  // ── Editor ────────────────────────────────────────────────────────────────────
  const openEditor = (entry) => {
    setEditorFilters({ ...DEFAULT_FILTERS });
    setEditorModal({ entry });
  };

  const handleEditorFilter = (key, value) => {
    if (key === 'reset') {
      setEditorFilters({ ...DEFAULT_FILTERS });
      editorRef.current?.updateFilter('reset', null);
    } else {
      setEditorFilters(prev => ({ ...prev, [key]: value }));
      editorRef.current?.updateFilter(key, value);
    }
  };

  const handleEditorToolbar = (action) => {
    const ed = editorRef.current;
    if (!ed) return;
    if (action === 'resetAll') { ed.resetAll(); setEditorFilters({ ...DEFAULT_FILTERS }); return; }
    ed[action]?.();
  };

  const applyEditorEdits = async () => {
    if (!editorRef.current || !editorModal) return;
    const blob = await editorRef.current.getBlob('png', 1);
    if (!blob) return;
    const edited = new File([blob], editorModal.entry.file.name, { type: 'image/png' });
    upd(editorModal.entry.id, { editedFile: edited, status: 'idle', blob: null });
    setEditorModal(null);
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const doneCount = entries.filter(e => e.status === 'done').length;
  const hasFiles  = entries.length > 0;

  return (
    <ToolLayout
      title="Image Converter"
      description="Batch convert, resize, rotate, and edit images. Download individually or as ZIP."
      icon={<ConvertImageIcon className="w-6 h-6" />}
      category="Images"
      seoContent={seoContent}
    >
      {/* ── Editor Modal ──────────────────────────────────────────────────────── */}
      {editorModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col" onClick={() => setEditorModal(null)}>
          <div className="flex flex-col flex-1 m-4 bg-white rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <p className="font-semibold text-gray-800 text-sm">
                Editing: <span className="text-blue-600">{editorModal.entry.stem}</span>
              </p>
              <div className="flex gap-2">
                <button onClick={applyEditorEdits} className="btn btn-primary text-xs px-4 py-2">
                  Apply Edits
                </button>
                <button onClick={() => setEditorModal(null)} className="text-gray-400 hover:text-gray-700 p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1 p-4 overflow-auto space-y-2">
                <CanvasToolbar onAction={handleEditorToolbar} disabled={false} />
                <ImageEditor ref={editorRef} imageFile={editorModal.entry.editedFile || editorModal.entry.file} />
              </div>
              <div className="w-56 border-l border-gray-100 p-4 overflow-y-auto shrink-0">
                <FilterControls filters={editorFilters} onChange={handleEditorFilter} disabled={false} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Before/After Modal ────────────────────────────────────────────────── */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <p className="font-semibold text-sm text-gray-800">Before / After — {preview.entry.stem}</p>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 p-5">
              <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Original · {formatBytes(preview.entry.file.size)}
                </p>
                <img src={URL.createObjectURL(preview.entry.editedFile || preview.entry.file)}
                  alt="original" className="w-full rounded-lg object-contain max-h-72 bg-gray-50 border border-gray-100" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">
                  Converted · {formatBytes(preview.entry.blob?.size || 0)}
                  {preview.entry.outW > 0 && <span className="ml-2">{preview.entry.outW}×{preview.entry.outH}px</span>}
                </p>
                <img src={URL.createObjectURL(preview.entry.blob)}
                  alt="converted" className="w-full rounded-lg object-contain max-h-72 bg-gray-50 border border-gray-100" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Dropzone ──────────────────────────────────────────────────────────── */}
      <div {...getRootProps()}
        className={`card flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}>
        <input {...getInputProps()} />
        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <div className="text-center">
          <p className="font-semibold text-gray-700">{isDragActive ? 'Drop images here…' : 'Drag & drop images here'}</p>
          <p className="text-xs text-gray-400 mt-1">JPG · PNG · WebP · AVIF · GIF · TIFF · SVG · HEIC and more</p>
          <p className="text-xs text-gray-300 mt-0.5">Up to {MAX_FILES} files per batch</p>
        </div>
        {hasFiles && !isDragActive && (
          <span className="text-xs text-blue-500 underline">+ Add more images</span>
        )}
      </div>

      {/* ── Global Settings ───────────────────────────────────────────────────── */}
      {hasFiles && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Global Settings</p>
            <button onClick={applyGlobal}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
              Apply to all {entries.length} files →
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {OUTPUT_FORMATS.map(f => (
              <button key={f.value} onClick={() => setGlobalFormat(f.value)} title={f.desc}
                className={`py-2 rounded-xl border text-sm font-semibold transition-colors ${
                  globalFormat === f.value
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-gray-200 hover:border-blue-300 text-gray-600 hover:bg-blue-50'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {OUTPUT_FORMATS.find(f => f.value === globalFormat)?.lossy && (
            <div>
              <label className="label">
                Quality: <span className="text-blue-600 font-semibold">{globalQuality}%</span>
              </label>
              <input type="range" min={1} max={100} value={globalQuality}
                onChange={e => setGlobalQuality(+e.target.value)} className="w-full accent-blue-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Smaller file</span><span>Better quality</span>
              </div>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button onClick={handleConvertAll} disabled={converting}
              className="flex-1 btn btn-primary py-3 text-sm font-semibold disabled:opacity-40 min-w-40">
              {converting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Converting…
                </span>
              ) : `Convert All (${entries.length} file${entries.length !== 1 ? 's' : ''})`}
            </button>

            {doneCount > 1 && (
              <button onClick={dlZip} disabled={zipBusy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors">
                {zipBusy
                  ? <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                }
                ZIP ({doneCount})
              </button>
            )}

            <button onClick={() => setEntries([])} disabled={converting}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-400 hover:text-red-500 hover:border-red-200 disabled:opacity-40 transition-colors" title="Clear all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── File List ─────────────────────────────────────────────────────────── */}
      {hasFiles && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {entries.length} file{entries.length !== 1 ? 's' : ''}
            </p>
            {doneCount > 0 && (
              <p className="text-xs text-green-600 font-medium">{doneCount} converted</p>
            )}
          </div>

          {entries.map((entry) => {
            const fmt     = OUTPUT_FORMATS.find(f => f.value === entry.format);
            const isOpen  = expanded === entry.id;
            const savePct = entry.blob && entry.file.size > 0
              ? Math.round((1 - entry.blob.size / entry.file.size) * 100)
              : 0;

            return (
              <div key={entry.id}
                className={`card py-3 px-4 space-y-3 transition-colors ${
                  entry.status === 'done'       ? 'border border-green-100 bg-green-50/40' :
                  entry.status === 'error'      ? 'border border-red-100 bg-red-50/40' :
                  entry.status === 'converting' ? 'border border-blue-100 bg-blue-50/20' : ''
                }`}>

                {/* ── Main row ──────────────────────────────────────── */}
                <div className="flex items-center gap-3">
                  {/* Thumb */}
                  <div className="relative shrink-0">
                    <img src={URL.createObjectURL(entry.editedFile || entry.file)} alt=""
                      className="w-11 h-11 object-cover rounded-lg border border-gray-100" />
                    {entry.editedFile && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white" title="Editor applied" />
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <input type="text" value={entry.stem}
                        onChange={e => upd(entry.id, { stem: e.target.value })}
                        className="text-sm font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none w-full truncate transition-colors"
                        title="Click to rename" />
                      <span className="text-xs text-gray-400 shrink-0">.{fmt?.ext}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5 flex-wrap">
                      <span>{formatBytes(entry.file.size)}</span>
                      {entry.status === 'done' && (
                        <>
                          <span>→</span>
                          <span className={savePct > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                            {formatBytes(entry.blob.size)}
                          </span>
                          {savePct > 0  && <span className="text-green-600 font-semibold">−{savePct}%</span>}
                          {savePct < 0  && <span className="text-amber-500 font-medium">+{Math.abs(savePct)}% larger</span>}
                          {entry.outW > 0 && <span className="text-gray-300">· {entry.outW}×{entry.outH}px</span>}
                        </>
                      )}
                      {entry.status === 'error' && (
                        <span className="text-red-500 truncate max-w-xs">{entry.error}</span>
                      )}
                    </div>
                  </div>

                  {/* Format quick-select */}
                  <select value={entry.format}
                    onChange={e => upd(entry.id, { format: e.target.value, status: entry.status === 'done' ? 'idle' : entry.status })}
                    disabled={entry.status === 'converting'}
                    className="text-xs font-semibold border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:border-blue-400 disabled:opacity-50 shrink-0">
                    {OUTPUT_FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>

                  {/* Status + actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {entry.status === 'idle'       && <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">Pending</span>}
                    {entry.status === 'converting' && <span className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
                    {entry.status === 'done'       && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    {entry.status === 'error'      && <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>}

                    {/* Edit */}
                    <button onClick={() => openEditor(entry)} disabled={entry.status === 'converting'}
                      title="Open editor" className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>

                    {/* Preview */}
                    {entry.status === 'done' && (
                      <button onClick={() => setPreview({ entry })} title="Before/After preview"
                        className="p-1 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    )}

                    {/* Download */}
                    {entry.status === 'done' && (
                      <button onClick={() => dlOne(entry)} title="Download"
                        className="p-1 rounded text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    )}

                    {/* Retry */}
                    {entry.status === 'error' && (
                      <button onClick={() => upd(entry.id, { status: 'idle', error: '' })}
                        className="text-xs text-red-500 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-50 transition-colors">
                        Retry
                      </button>
                    )}

                    {/* Settings toggle */}
                    <button onClick={() => setExpanded(isOpen ? null : entry.id)}
                      title="Per-file settings"
                      className={`p-1 rounded transition-colors ${isOpen ? 'text-blue-600 bg-blue-50' : 'text-gray-300 hover:text-gray-600 hover:bg-gray-50'}`}>
                      <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Remove */}
                    <button onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}
                      disabled={entry.status === 'converting'}
                      className="p-1 text-gray-300 hover:text-red-400 disabled:opacity-30 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* ── Expanded settings ──────────────────────────────── */}
                {isOpen && (
                  <div className="border-t border-gray-100 pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">

                    {/* Quality */}
                    <div className="col-span-2">
                      <label className="label text-xs">
                        Quality: <span className="text-blue-600 font-semibold">{entry.quality}%</span>
                        {!fmt?.lossy && <span className="ml-1 text-gray-400 font-normal">(lossless format — quality ignored)</span>}
                      </label>
                      <input type="range" min={1} max={100} value={entry.quality}
                        onChange={e => upd(entry.id, { quality: +e.target.value })}
                        disabled={!fmt?.lossy}
                        className="w-full accent-blue-600 disabled:opacity-30" />
                    </div>

                    {/* Width */}
                    <div>
                      <label className="label text-xs">Width (px)</label>
                      <input type="number" min={1} className="input text-sm" placeholder="auto"
                        value={entry.width} onChange={e => upd(entry.id, { width: e.target.value })} />
                    </div>

                    {/* Height */}
                    <div>
                      <label className="label text-xs">Height (px)</label>
                      <input type="number" min={1} className="input text-sm" placeholder="auto"
                        value={entry.height} onChange={e => upd(entry.id, { height: e.target.value })} />
                    </div>

                    {/* Fit */}
                    <div className="col-span-2">
                      <label className="label text-xs">Resize Fit</label>
                      <select className="input text-sm" value={entry.fit}
                        onChange={e => upd(entry.id, { fit: e.target.value })}>
                        {FIT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>

                    {/* Transform */}
                    <div className="col-span-2">
                      <label className="label text-xs">Transform (server-side)</label>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => upd(entry.id, { rotate: (entry.rotate - 90 + 360) % 360 })}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                          {entry.rotate}°
                        </button>
                        <button onClick={() => upd(entry.id, { rotate: (entry.rotate + 90) % 360 })}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg>
                          CW
                        </button>
                        <button onClick={() => upd(entry.id, { flipH: !entry.flipH })}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${entry.flipH ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                          ⟺ Flip H
                        </button>
                        <button onClick={() => upd(entry.id, { flipV: !entry.flipV })}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${entry.flipV ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                          ⇅ Flip V
                        </button>
                        {(entry.rotate !== 0 || entry.flipH || entry.flipV) && (
                          <button onClick={() => upd(entry.id, { rotate: 0, flipH: false, flipV: false })}
                            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                            Reset
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Per-file convert */}
                    <div className="col-span-2 sm:col-span-4 flex items-center gap-3 pt-1 border-t border-gray-100">
                      <button onClick={() => convertOne(entry)} disabled={entry.status === 'converting'}
                        className="btn btn-primary text-xs px-4 py-2 disabled:opacity-40">
                        {entry.status === 'converting' ? 'Converting…' : entry.status === 'done' ? 'Re-convert' : 'Convert this file'}
                      </button>
                      {entry.editedFile && (
                        <span className="flex items-center text-xs text-blue-600 gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          Editor edits applied
                        </span>
                      )}
                      {(entry.width || entry.height) && (
                        <span className="text-xs text-gray-400">
                          → {entry.width || 'auto'} × {entry.height || 'auto'} px ({entry.fit})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Bottom ZIP CTA ────────────────────────────────────────────────────── */}
      {doneCount > 1 && (
        <button onClick={dlZip} disabled={zipBusy}
          className="w-full btn btn-primary py-3 text-sm font-semibold disabled:opacity-40">
          {zipBusy ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Building ZIP…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download All as ZIP ({doneCount} files)
            </span>
          )}
        </button>
      )}

      {/* ── Format support note ───────────────────────────────────────────────── */}
      <div className="card bg-amber-50 border border-amber-100 text-xs text-amber-700 space-y-1">
        <p className="font-semibold">Supported output formats (Sharp-powered server)</p>
        <p>JPEG · PNG · WebP · AVIF · TIFF · GIF</p>
        <p className="text-amber-500">
          PSD, AI, EPS, RAW (CR2/NEF/ARW), ICO, BMP output require ImageMagick — not yet available.
          SVG and HEIC are accepted as input (server-dependent).
        </p>
      </div>
    </ToolLayout>
  );
}
