import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import ImageEditor from '../../components/editor/ImageEditor';
import CanvasToolbar from '../../components/editor/CanvasToolbar';
import FilterControls from '../../components/editor/FilterControls';
import { ImageCropToolIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Image Crop Tool lets you crop any image directly in your browser — no upload to any server. Edit first (rotate, flip, adjust brightness/contrast), then draw a crop region, lock an aspect ratio, or enter exact pixel dimensions.',
  howTo: [
    'Upload an image using the file picker or drag-and-drop.',
    'Use the editor toolbar to rotate, flip, or apply filters.',
    'Click "Apply Edits to Crop" to lock in your edits.',
    'Draw a crop rectangle, resize with 8 handles, then click "Crop →".',
  ],
  features: [
    'Rotate, flip, brightness, contrast, saturation, blur filters',
    '8 drag handles: resize from any corner or edge',
    'Aspect ratio lock: FreeForm, 1:1, 4:3, 16:9, and more',
    'Exact pixel inputs for width, height, X and Y position',
    'Rule-of-thirds guide grid inside the selection',
    '100% client-side — image never leaves your browser',
  ],
  faq: [
    { q: 'What format is the cropped image saved as?', a: 'The crop output is always saved as a PNG for lossless quality.' },
    { q: 'Can I enter exact pixel dimensions?', a: 'Yes. Type directly into the Width, Height, X, or Y fields in the sidebar.' },
    { q: 'Is there a maximum file size?', a: 'No hard limit is enforced, but images above ~20 MB may be slow to render.' },
  ],
};

const ASPECT_RATIOS = [
  { label: 'FreeForm', value: '' },
  { label: '1:1',  value: '1'      },
  { label: '4:3',  value: '1.3333' },
  { label: '3:2',  value: '1.5'    },
  { label: '16:9', value: '1.7778' },
  { label: '2:3',  value: '0.6667' },
  { label: '3:4',  value: '0.75'   },
  { label: '9:16', value: '0.5625' },
];

const HANDLE_CURSORS = {
  nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize',
  e:  'e-resize',  se: 'se-resize', s: 's-resize',
  sw: 'sw-resize', w: 'w-resize',
};

const DEFAULT_FILTERS = { brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false };

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function handlePositions(sel) {
  const { x, y, w, h } = sel;
  return {
    nw: { left: x,       top: y       },
    n:  { left: x + w/2, top: y       },
    ne: { left: x + w,   top: y       },
    e:  { left: x + w,   top: y + h/2 },
    se: { left: x + w,   top: y + h   },
    s:  { left: x + w/2, top: y + h   },
    sw: { left: x,       top: y + h   },
    w:  { left: x,       top: y + h/2 },
  };
}

export default function ImageCropTool() {
  // ── File / editor state ──────────────────────────────────────────────────
  const [file, setFile]         = useState(null);
  const [filters, setFilters]   = useState({ ...DEFAULT_FILTERS });
  const editorRef               = useRef(null);

  // ── Crop state ───────────────────────────────────────────────────────────
  const [imgSrc, setImgSrc]     = useState(null);   // applied crop source
  const [nat, setNat]           = useState({ w: 0, h: 0 });
  const [disp, setDisp]         = useState({ w: 0, h: 0 });
  const [sel, setSel]           = useState(null);
  const [drag, setDrag]         = useState(null);
  const [arValue, setArValue]   = useState('');
  const [cropped, setCropped]   = useState(null);

  const imgRef    = useRef(null);
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);

  useSEO({
    title: 'Image Crop Tool',
    description: 'Crop images online with built-in editor — rotate, flip, filters, drag handles, aspect ratio lock.',
    keywords: ['image crop tool', 'crop image online', 'crop photo', 'image cropper', 'online image crop'],
    jsonLd: [
      buildToolSchema({ name: 'Image Crop Tool', description: 'Crop images in the browser with editor, drag handles and aspect ratio lock', url: '/tools/image-crop' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/image-crop',
  });

  const sx = disp.w ? nat.w / disp.w : 1;
  const sy = disp.h ? nat.h / disp.h : 1;
  const toNat  = (v, s) => Math.round(v * s);
  const toDisp = (v, s) => v / s;
  const natSel = sel ? {
    x: toNat(sel.x, sx), y: toNat(sel.y, sy),
    w: toNat(sel.w, sx), h: toNat(sel.h, sy),
  } : null;
  const hasSel = sel && sel.w > 4 && sel.h > 4;

  // ── File upload ──────────────────────────────────────────────────────────
  const handleFile = useCallback((f) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFile(f);
      setImgSrc(e.target.result);
      setSel(null); setCropped(null);
      setFilters({ ...DEFAULT_FILTERS });
    };
    reader.readAsDataURL(f);
  }, []);

  // ── Track displayed image size ───────────────────────────────────────────
  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    setDisp({ w: img.clientWidth, h: img.clientHeight });
  };

  useEffect(() => {
    if (!imgSrc) return;
    const ob = new ResizeObserver(() => {
      if (imgRef.current) {
        setDisp({ w: imgRef.current.clientWidth, h: imgRef.current.clientHeight });
        setSel(null); setCropped(null);
      }
    });
    if (wrapRef.current) ob.observe(wrapRef.current);
    return () => ob.disconnect();
  }, [imgSrc]);

  // ── Editor: toolbar actions ──────────────────────────────────────────────
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
        break;
    }
  }

  function handleFilterChange(key, value) {
    if (key === 'reset') {
      setFilters({ ...DEFAULT_FILTERS });
      editorRef.current?.updateFilter('reset', null);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
      editorRef.current?.updateFilter(key, value);
    }
  }

  // ── Apply edits → export from fabric → becomes new crop source ───────────
  async function applyEditsToCrop() {
    const ed = editorRef.current;
    if (!ed) return;
    const dataURL = ed.getDataURL('png', 1);
    if (!dataURL) return;
    setImgSrc(dataURL);
    setSel(null); setCropped(null);
  }

  // ── Crop drag logic ──────────────────────────────────────────────────────
  const eventPos = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clamp(cx - rect.left, 0, disp.w), y: clamp(cy - rect.top, 0, disp.h) };
  };

  const applyAR = (s, ar, anchor = 'w') => {
    if (!ar) return s;
    const ratio = parseFloat(ar);
    if (anchor === 'w') return { ...s, h: clamp(s.w / ratio, 1, disp.h - s.y) };
    return { ...s, w: clamp(s.h * ratio, 1, disp.w - s.x) };
  };

  const onContainerDown = (e) => {
    if (!imgRef.current) return;
    e.preventDefault();
    const pos = eventPos(e);
    if (hasSel && pos.x >= sel.x && pos.x <= sel.x + sel.w && pos.y >= sel.y && pos.y <= sel.y + sel.h) {
      setDrag({ type: 'move', mx: pos.x, my: pos.y, sel: { ...sel } });
      return;
    }
    setSel({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setDrag({ type: 'new', mx: pos.x, my: pos.y, sel: { x: pos.x, y: pos.y, w: 0, h: 0 } });
    setCropped(null);
  };

  const onHandleDown = (e, handle) => {
    e.preventDefault(); e.stopPropagation();
    setDrag({ type: handle, mx: eventPos(e).x, my: eventPos(e).y, sel: { ...sel } });
  };

  const onMouseMove = (e) => {
    if (!drag) return;
    e.preventDefault();
    const pos = eventPos(e);
    const dx = pos.x - drag.mx, dy = pos.y - drag.my;
    const orig = drag.sel;
    let ns = { ...orig };

    if (drag.type === 'new') {
      ns = { x: Math.min(pos.x, drag.mx), y: Math.min(pos.y, drag.my), w: Math.abs(pos.x - drag.mx), h: Math.abs(pos.y - drag.my) };
      if (arValue) ns = applyAR(ns, arValue);
    } else if (drag.type === 'move') {
      ns.x = clamp(orig.x + dx, 0, disp.w - orig.w);
      ns.y = clamp(orig.y + dy, 0, disp.h - orig.h);
    } else {
      const h = drag.type;
      if (h.includes('e')) ns.w = clamp(orig.w + dx, 10, disp.w - orig.x);
      if (h.includes('w')) { const nx = clamp(orig.x + dx, 0, orig.x + orig.w - 10); ns.w = orig.w - (nx - orig.x); ns.x = nx; }
      if (h.includes('s')) ns.h = clamp(orig.h + dy, 10, disp.h - orig.y);
      if (h.includes('n')) { const ny = clamp(orig.y + dy, 0, orig.y + orig.h - 10); ns.h = orig.h - (ny - orig.y); ns.y = ny; }
      if (arValue) ns = h === 'n' || h === 's' ? applyAR(ns, arValue, 'h') : applyAR(ns, arValue, 'w');
    }
    setSel(ns);
  };

  const onMouseUp = () => setDrag(null);

  const onInputChange = (field, raw) => {
    const v = parseInt(raw);
    if (isNaN(v) || !sel) return;
    let ns = { ...sel };
    if (field === 'w') ns.w = toDisp(clamp(v, 1, nat.w - toNat(sel.x, sx)), sx);
    if (field === 'h') ns.h = toDisp(clamp(v, 1, nat.h - toNat(sel.y, sy)), sy);
    if (field === 'x') ns.x = toDisp(clamp(v, 0, nat.w - toNat(sel.w, sx)), sx);
    if (field === 'y') ns.y = toDisp(clamp(v, 0, nat.h - toNat(sel.h, sy)), sy);
    setSel(ns);
  };

  const onArChange = (val) => {
    setArValue(val);
    if (val && sel && sel.w > 4) setSel(s => applyAR(s, val));
  };

  const resetSel = () => { setSel(null); setCropped(null); };

  const doCrop = () => {
    if (!hasSel || !natSel) return;
    const canvas = canvasRef.current;
    canvas.width = natSel.w; canvas.height = natSel.h;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, natSel.x, natSel.y, natSel.w, natSel.h, 0, 0, natSel.w, natSel.h);
      const url = canvas.toDataURL('image/png');
      setCropped(url);
      const a = document.createElement('a');
      a.href = url; a.download = 'cropped.png'; a.click();
    };
    img.src = imgSrc;
  };

  const cursorStyle = drag ? (HANDLE_CURSORS[drag.type] || 'crosshair') : 'crosshair';

  return (
    <ToolLayout
      title="Image Crop Tool"
      description="Edit and crop any image in your browser — rotate, flip, filters, drag handles, aspect ratio lock."
      icon={<ImageCropToolIcon className="w-6 h-6" />}
      category="Images"
      seoContent={seoContent}
    >
      {/* ── Upload ─────────────────────────────────────────────────────── */}
      {!file && (
        <div className="card">
          <FileUpload accept="image/*" onFileSelect={handleFile} label="Upload Image" helpText="JPEG, PNG, WebP, or GIF" />
        </div>
      )}

      {/* ── Editor section ─────────────────────────────────────────────── */}
      {file && (
        <div className="space-y-3">
          <CanvasToolbar onAction={handleToolbarAction} disabled={false} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Canvas — 3/4 width */}
            <div className="lg:col-span-3">
              <ImageEditor ref={editorRef} imageFile={file} />
            </div>

            {/* Filters sidebar */}
            <div className="card">
              <FilterControls filters={filters} onChange={handleFilterChange} disabled={false} />
            </div>
          </div>

          {/* Apply edits → proceed to crop */}
          <div className="flex items-center gap-3">
            <button
              onClick={applyEditsToCrop}
              className="btn btn-primary px-5 py-2.5 text-sm font-semibold"
            >
              Apply Edits → Crop
            </button>
            <button
              onClick={() => { setFile(null); setImgSrc(null); setSel(null); setCropped(null); }}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Remove image
            </button>
            {imgSrc && imgSrc !== '' && (
              <span className="text-xs text-gray-400">or draw crop below without applying edits</span>
            )}
          </div>
        </div>
      )}

      {/* ── Crop section ───────────────────────────────────────────────── */}
      {imgSrc && (
        <div className="flex flex-col lg:flex-row gap-4 items-start">

          {/* Sidebar */}
          <div className="lg:w-60 w-full shrink-0 card space-y-5">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Crop Rectangle</p>
              <div className="grid grid-cols-2 gap-2">
                {[['w','Width'],['h','Height']].map(([f, label]) => (
                  <div key={f}>
                    <label className="label text-xs">{label}</label>
                    <input type="number" min={1} className="input text-sm"
                      value={natSel?.[f] ?? ''} disabled={!hasSel}
                      onChange={e => onInputChange(f, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="label text-xs">Aspect Ratio</label>
              <select className="input text-sm" value={arValue} onChange={e => onArChange(e.target.value)}>
                {ASPECT_RATIOS.map(r => <option key={r.label} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Crop Position</p>
              <div className="grid grid-cols-2 gap-2">
                {[['x','X'],['y','Y']].map(([f, label]) => (
                  <div key={f}>
                    <label className="label text-xs">Position {label}</label>
                    <input type="number" min={0} className="input text-sm"
                      value={natSel?.[f] ?? ''} disabled={!hasSel}
                      onChange={e => onInputChange(f, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center">{nat.w} × {nat.h} px</p>

            <button onClick={resetSel}
              className="w-full py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              Reset Selection
            </button>

            <button onClick={doCrop} disabled={!hasSel}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm">
              Crop →
            </button>
          </div>

          {/* Image + overlay */}
          <div className="flex-1 min-w-0 space-y-2">
            <div
              ref={wrapRef}
              className="relative select-none overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
              style={{ cursor: cursorStyle }}
              onMouseDown={onContainerDown} onMouseMove={onMouseMove}
              onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
              onTouchStart={onContainerDown} onTouchMove={onMouseMove} onTouchEnd={onMouseUp}
            >
              <img ref={imgRef} src={imgSrc} alt="crop source"
                className="w-full block" onLoad={onImgLoad} draggable={false} />

              {hasSel && (() => {
                const { x, y, w, h } = sel;
                return (
                  <>
                    <div className="absolute pointer-events-none bg-black/50" style={{ left:0, top:0, width:'100%', height:y }} />
                    <div className="absolute pointer-events-none bg-black/50" style={{ left:0, top:y+h, width:'100%', height:`calc(100% - ${y+h}px)` }} />
                    <div className="absolute pointer-events-none bg-black/50" style={{ left:0, top:y, width:x, height:h }} />
                    <div className="absolute pointer-events-none bg-black/50" style={{ left:x+w, top:y, width:`calc(100% - ${x+w}px)`, height:h }} />
                    <div className="absolute pointer-events-none border-2 border-white overflow-hidden" style={{ left:x, top:y, width:w, height:h }}>
                      <div className="absolute top-0 bottom-0 border-l border-white/40" style={{ left:'33.33%' }} />
                      <div className="absolute top-0 bottom-0 border-l border-white/40" style={{ left:'66.66%' }} />
                      <div className="absolute left-0 right-0 border-t border-white/40" style={{ top:'33.33%' }} />
                      <div className="absolute left-0 right-0 border-t border-white/40" style={{ top:'66.66%' }} />
                    </div>
                    {Object.entries(handlePositions(sel)).map(([handle, pos]) => (
                      <div key={handle}
                        className="absolute z-20 w-4 h-4 bg-white rounded-full border-2 border-gray-400 shadow"
                        style={{ left:pos.left, top:pos.top, transform:'translate(-50%,-50%)', cursor:HANDLE_CURSORS[handle] }}
                        onMouseDown={e => onHandleDown(e, handle)}
                        onTouchStart={e => onHandleDown(e, handle)} />
                    ))}
                  </>
                );
              })()}
            </div>
            <p className="text-xs text-gray-400 text-center">Drag to select · Drag handles to resize · Drag inside to move</p>
          </div>
        </div>
      )}

      {/* Crop preview */}
      {cropped && (
        <div className="card space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Cropped Preview</p>
          <img src={cropped} alt="cropped result" className="max-w-full rounded-xl border border-gray-100" />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
