import { useEffect, useRef, useImperativeHandle, forwardRef, useState, useCallback } from 'react';

const DEFAULT_FILTERS = {
  brightness: 0, contrast: 0, saturation: 0, blur: 0, grayscale: false,
};

const ImageEditor = forwardRef(function ImageEditor({ imageFile, onReady }, ref) {
  const containerRef  = useRef(null);
  const canvasRef     = useRef(null);
  const fabricRef     = useRef(null);   // fabric namespace
  const fcRef         = useRef(null);   // fabric.Canvas instance
  const imgRef        = useRef(null);   // active fabric.Image
  const filtersState  = useRef({ ...DEFAULT_FILTERS });

  const [canvasReady, setCanvasReady] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [imgLoaded, setImgLoaded]     = useState(false);

  // ── 1. Init fabric canvas (runs once on mount) ────────────────────────────
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Dynamic import avoids Vite ESM issues with fabric's UMD build
      const mod = await import('fabric');
      if (cancelled) return;

      // fabric v5 exports as mod.fabric or as the module itself
      const fabric = mod.fabric ?? mod;
      fabricRef.current = fabric;

      // Wait for the DOM to paint so containerRef has real clientWidth
      await new Promise(r => requestAnimationFrame(r));
      if (cancelled) return;

      const container = containerRef.current;
      if (!container) return;

      const w = container.clientWidth  || 600;
      const h = Math.round(w * 0.5625) || 338;   // 16:9

      const fc = new fabric.Canvas(canvasRef.current, {
        width:            w,
        height:           h,
        backgroundColor:  '#1f2937',
        selection:        false,
        preserveObjectStacking: true,
      });
      fcRef.current = fc;

      // Alt + drag → pan
      fc.on('mouse:down', opt => {
        if (opt.e.altKey) {
          fc.isDragging = true;
          fc.lastPosX   = opt.e.clientX;
          fc.lastPosY   = opt.e.clientY;
        }
      });
      fc.on('mouse:move', opt => {
        if (!fc.isDragging) return;
        const vpt = fc.viewportTransform;
        vpt[4] += opt.e.clientX - fc.lastPosX;
        vpt[5] += opt.e.clientY - fc.lastPosY;
        fc.lastPosX = opt.e.clientX;
        fc.lastPosY = opt.e.clientY;
        fc.requestRenderAll();
      });
      fc.on('mouse:up', () => { fc.isDragging = false; });

      // Scroll → zoom
      fc.on('mouse:wheel', opt => {
        opt.e.preventDefault();
        let zoom = fc.getZoom() * (0.999 ** opt.e.deltaY);
        zoom = Math.min(Math.max(zoom, 0.1), 10);
        fc.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      });

      setCanvasReady(true);
    })();

    return () => {
      cancelled = true;
      fcRef.current?.dispose();
      fcRef.current = null;
    };
  }, []);

  // ── 2. Load image whenever file changes AND canvas is ready ───────────────
  useEffect(() => {
    if (!imageFile || !canvasReady || !fcRef.current || !fabricRef.current) return;

    const fc     = fcRef.current;
    const fabric = fabricRef.current;

    setLoading(true);
    setImgLoaded(false);
    filtersState.current = { ...DEFAULT_FILTERS };

    // Use FileReader so we don't need crossOrigin on a blob URL
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;

      fabric.Image.fromURL(dataUrl, (img) => {
        if (!img) { setLoading(false); return; }

        fc.clear();
        fc.backgroundColor = '#1f2937';

        // Scale to fit with 5% padding
        const scale = Math.min(fc.width / img.width, fc.height / img.height) * 0.95;
        img.set({
          left:        fc.width  / 2,
          top:         fc.height / 2,
          originX:     'center',
          originY:     'center',
          scaleX:      scale,
          scaleY:      scale,
          selectable:  true,
          hasControls: true,
          hasBorders:  true,
        });

        fc.add(img);
        fc.setActiveObject(img);
        fc.setViewportTransform([1, 0, 0, 1, 0, 0]);
        fc.renderAll();

        imgRef.current = img;
        setLoading(false);
        setImgLoaded(true);
        onReady?.();
      });
    };
    reader.readAsDataURL(imageFile);
  }, [imageFile, canvasReady]);

  // ── Apply filters ─────────────────────────────────────────────────────────
  const applyFilters = useCallback((overrides = {}) => {
    if (!imgRef.current || !fabricRef.current || !fcRef.current) return;
    const fabric = fabricRef.current;
    const f = { ...filtersState.current, ...overrides };
    filtersState.current = f;
    const img = imgRef.current;
    img.filters = [];
    if (f.brightness !== 0) img.filters.push(new fabric.Image.filters.Brightness({ brightness: f.brightness }));
    if (f.contrast   !== 0) img.filters.push(new fabric.Image.filters.Contrast({ contrast: f.contrast }));
    if (f.saturation !== 0) img.filters.push(new fabric.Image.filters.Saturation({ saturation: f.saturation }));
    if (f.blur        > 0)  img.filters.push(new fabric.Image.filters.Blur({ blur: f.blur / 100 }));
    if (f.grayscale)        img.filters.push(new fabric.Image.filters.Grayscale());
    img.applyFilters();
    fcRef.current.renderAll();
  }, []);

  // ── Expose API via ref ────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    rotateLeft()  {
      const img = imgRef.current; if (!img) return;
      img.rotate((img.angle - 90 + 360) % 360); fcRef.current?.renderAll();
    },
    rotateRight() {
      const img = imgRef.current; if (!img) return;
      img.rotate((img.angle + 90) % 360); fcRef.current?.renderAll();
    },
    flipH() {
      const img = imgRef.current; if (!img) return;
      img.set('flipX', !img.flipX); fcRef.current?.renderAll();
    },
    flipV() {
      const img = imgRef.current; if (!img) return;
      img.set('flipY', !img.flipY); fcRef.current?.renderAll();
    },
    zoomIn()    { const fc = fcRef.current; if (!fc) return; fc.setZoom(Math.min(fc.getZoom() * 1.25, 10)); },
    zoomOut()   { const fc = fcRef.current; if (!fc) return; fc.setZoom(Math.max(fc.getZoom() / 1.25, 0.1)); },
    resetView() { fcRef.current?.setViewportTransform([1, 0, 0, 1, 0, 0]); fcRef.current?.renderAll(); },
    resetAll() {
      const img = imgRef.current; const fc = fcRef.current;
      if (!img || !fc) return;
      img.set({ angle: 0, flipX: false, flipY: false, filters: [] });
      img.applyFilters();
      fc.setViewportTransform([1, 0, 0, 1, 0, 0]);
      fc.renderAll();
      filtersState.current = { ...DEFAULT_FILTERS };
    },
    updateFilter(key, value) {
      if (key === 'reset') {
        filtersState.current = { ...DEFAULT_FILTERS };
        applyFilters({ ...DEFAULT_FILTERS });
      } else {
        applyFilters({ [key]: value });
      }
    },
    getFilters() { return { ...filtersState.current }; },
    getDataURL(format = 'png', quality = 0.92) {
      const fc = fcRef.current; if (!fc) return null;
      const vpt = fc.viewportTransform.slice();
      fc.setViewportTransform([1, 0, 0, 1, 0, 0]);
      const dataURL = fc.toDataURL({ format, quality });
      fc.setViewportTransform(vpt);
      return dataURL;
    },
    async getBlob(format = 'png', quality = 0.92) {
      const dataURL = this.getDataURL(format === 'jpg' ? 'jpeg' : format, quality);
      if (!dataURL) return null;
      const res = await fetch(dataURL);
      return res.blob();
    },
    isReady() { return imgLoaded; },
  }), [imgLoaded, applyFilters]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden bg-gray-800 relative"
      style={{ minHeight: '200px' }}
    >
      <canvas ref={canvasRef} className="block" />

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 rounded-xl">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Placeholder when no image */}
      {!imageFile && !loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-500">
          <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm">Upload an image to start editing</span>
        </div>
      )}

      {/* Hint */}
      {imgLoaded && (
        <div className="absolute bottom-2 right-3 text-[10px] text-gray-400 bg-gray-900/50 px-2 py-0.5 rounded">
          Alt+drag to pan · Scroll to zoom
        </div>
      )}
    </div>
  );
});

export default ImageEditor;
