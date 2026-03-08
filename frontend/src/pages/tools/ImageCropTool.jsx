import { useState, useRef, useCallback, useEffect } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import { ImageCropToolIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Image Crop Tool lets you crop any image directly in your browser — no upload to any server. Draw a crop region by clicking and dragging, then download the cropped result as a PNG. Supports JPEG, PNG, WebP, and GIF files.',
  howTo: [
    'Upload an image using the file picker or drag-and-drop.',
    'Click and drag on the image to draw a crop rectangle.',
    'Adjust the selection by dragging again.',
    'Click "Crop & Download" to save the cropped image.',
  ],
  features: [
    'Drag-to-select crop region on the image',
    'Live crop preview with selection overlay',
    'Outputs a lossless PNG download',
    'Shows crop dimensions (width × height)',
    'Supports JPEG, PNG, WebP, and GIF input',
    '100% client-side — image never leaves your browser',
  ],
  faq: [
    { q: 'What format is the cropped image saved as?', a: 'The crop output is always saved as a PNG for lossless quality. The filename is "cropped.png".' },
    { q: 'Can I crop animated GIFs?', a: 'The tool crops the first frame of an animated GIF. Animation is not preserved in the output.' },
    { q: 'Is there a maximum file size?', a: 'There is no hard limit enforced by the tool, but very large images (above ~20 MB) may be slow to render depending on your device.' },
  ],
};

export default function ImageCropTool() {
  const [imgSrc, setImgSrc]     = useState(null);
  const [imgNatural, setNatural] = useState({ w: 0, h: 0 });
  const [imgDisplay, setDisplay] = useState({ w: 0, h: 0 });
  const [sel, setSel]           = useState(null);   // { x,y,w,h } in display px
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [cropped, setCropped]   = useState(null);
  const imgRef  = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useSEO({
    title: 'Image Crop Tool',
    description: 'Crop images online — free, instant, browser-based. Draw a crop region and download the result as PNG. No upload required.',
    keywords: ['image crop tool', 'crop image online', 'crop photo', 'image cropper', 'online image crop'],
    jsonLd: [
      buildToolSchema({ name: 'Image Crop Tool', description: 'Crop images in the browser with a drag-to-select region', url: '/tools/image-crop' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/image-crop',
  });

  const handleFile = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target.result);
      setSel(null);
      setCropped(null);
    };
    reader.readAsDataURL(file);
  }, []);

  // When image loads, record natural + display sizes
  const onImgLoad = () => {
    const img = imgRef.current;
    if (!img) return;
    setNatural({ w: img.naturalWidth, h: img.naturalHeight });
    setDisplay({ w: img.clientWidth, h: img.clientHeight });
  };

  // Recalculate display size on resize
  useEffect(() => {
    if (!imgSrc) return;
    const ob = new ResizeObserver(() => {
      if (imgRef.current) {
        setDisplay({ w: imgRef.current.clientWidth, h: imgRef.current.clientHeight });
        setSel(null);
        setCropped(null);
      }
    });
    if (containerRef.current) ob.observe(containerRef.current);
    return () => ob.disconnect();
  }, [imgSrc]);

  const getPos = (e) => {
    const rect = imgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(0, Math.min(imgDisplay.w, clientX - rect.left)),
      y: Math.max(0, Math.min(imgDisplay.h, clientY - rect.top)),
    };
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    const pos = getPos(e);
    setDragStart(pos);
    setSel({ x: pos.x, y: pos.y, w: 0, h: 0 });
    setDragging(true);
    setCropped(null);
  };

  const onMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    e.preventDefault();
    const pos = getPos(e);
    setSel({
      x: Math.min(pos.x, dragStart.x),
      y: Math.min(pos.y, dragStart.y),
      w: Math.abs(pos.x - dragStart.x),
      h: Math.abs(pos.y - dragStart.y),
    });
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  const scaleToNatural = (val, axis) => {
    const scale = axis === 'x'
      ? imgNatural.w / imgDisplay.w
      : imgNatural.h / imgDisplay.h;
    return Math.round(val * scale);
  };

  const naturalSel = sel ? {
    x: scaleToNatural(sel.x, 'x'),
    y: scaleToNatural(sel.y, 'y'),
    w: scaleToNatural(sel.w, 'x'),
    h: scaleToNatural(sel.h, 'y'),
  } : null;

  const canCrop = naturalSel && naturalSel.w > 1 && naturalSel.h > 1;

  const doCrop = () => {
    if (!canCrop) return;
    const canvas = canvasRef.current;
    canvas.width  = naturalSel.w;
    canvas.height = naturalSel.h;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, naturalSel.x, naturalSel.y, naturalSel.w, naturalSel.h, 0, 0, naturalSel.w, naturalSel.h);
      const url = canvas.toDataURL('image/png');
      setCropped(url);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cropped.png';
      a.click();
    };
    img.src = imgSrc;
  };

  return (
    <ToolLayout
      title="Image Crop Tool"
      description="Crop any image in your browser — drag a selection and download the result as PNG."
      icon={<ImageCropToolIcon className="w-6 h-6" />}
      category="Images"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        {!imgSrc && (
          <FileUpload
            accept="image/*"
            onFileSelect={handleFile}
            label="Upload Image"
            helpText="JPEG, PNG, WebP, or GIF"
          />
        )}

        {imgSrc && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {imgNatural.w} × {imgNatural.h}px
                {canCrop && <span className="ml-3 text-blue-600">Selection: {naturalSel.w} × {naturalSel.h}px</span>}
              </span>
              <button
                onClick={() => { setImgSrc(null); setSel(null); setCropped(null); }}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors"
              >
                Remove image
              </button>
            </div>

            {/* Image + selection overlay */}
            <div
              ref={containerRef}
              className="relative select-none overflow-hidden rounded-xl border border-gray-100 cursor-crosshair"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onMouseDown}
              onTouchMove={onMouseMove}
              onTouchEnd={onMouseUp}
            >
              <img
                ref={imgRef}
                src={imgSrc}
                alt="crop source"
                className="w-full block"
                onLoad={onImgLoad}
                draggable={false}
              />
              {sel && sel.w > 2 && sel.h > 2 && (
                <>
                  {/* Darkened overlay — 4 rects around selection */}
                  <div className="absolute inset-0 bg-black/40 pointer-events-none" style={{
                    clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${sel.x}px ${sel.y}px, ${sel.x}px ${sel.y + sel.h}px, ${sel.x + sel.w}px ${sel.y + sel.h}px, ${sel.x + sel.w}px ${sel.y}px, ${sel.x}px ${sel.y}px)`,
                  }} />
                  {/* Selection border */}
                  <div
                    className="absolute border-2 border-white pointer-events-none"
                    style={{ left: sel.x, top: sel.y, width: sel.w, height: sel.h }}
                  />
                </>
              )}
            </div>

            <p className="text-xs text-gray-400 text-center">Click and drag on the image to select a crop area</p>

            <button
              onClick={doCrop}
              disabled={!canCrop}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-xl transition-colors text-sm"
            >
              Crop &amp; Download
            </button>

            {cropped && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</p>
                <img src={cropped} alt="cropped" className="max-w-full rounded-xl border border-gray-100" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden canvas for pixel operations */}
      <canvas ref={canvasRef} className="hidden" />
    </ToolLayout>
  );
}
