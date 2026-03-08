import { useState, useMemo, useRef } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { SvgOptimizerIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli SVG Optimizer cleans and minifies SVG files directly in your browser. It removes comments, XML declarations, editor metadata, empty elements, and unnecessary whitespace — reducing file size without affecting the visual appearance of the SVG.',
  howTo: [
    'Paste your SVG code or upload an .svg file.',
    'The optimised SVG appears instantly below with size savings.',
    'Toggle individual optimisations on or off as needed.',
    'Copy or download the cleaned SVG file.',
  ],
  features: [
    'Remove XML comments (<!-- ... -->)',
    'Remove XML/processing instructions (<?xml ...?>)',
    'Remove metadata, title, and desc elements',
    'Remove editor namespaces (Inkscape, Illustrator)',
    'Collapse whitespace and minify output',
    '100% client-side — SVG never leaves your browser',
  ],
  faq: [
    { q: 'Will optimising my SVG break it?', a: 'The tool applies safe, non-destructive optimisations. Removing metadata and comments does not affect rendering. Toggle options off if you need to keep specific elements.' },
    { q: 'Should I keep the title and desc elements?', a: 'For accessibility, keep <title> and <desc> in SVGs used inline in HTML pages. For background icons/images, removing them saves bytes without impact.' },
    { q: 'How does this compare to SVGO?', a: 'This tool applies a focused subset of safe text-based optimisations. SVGO offers more transforms (path rounding, merge paths) but requires Node.js. This tool runs entirely in your browser.' },
  ],
};

function optimizeSvg(input, opts) {
  let svg = input;

  if (opts.removeComments)    svg = svg.replace(/<!--[\s\S]*?-->/g, '');
  if (opts.removeXmlDecl)     svg = svg.replace(/<\?xml[\s\S]*?\?>/gi, '');
  if (opts.removeDoctypes)    svg = svg.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
  if (opts.removeMetadata)    svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  if (opts.removeTitleDesc)   svg = svg.replace(/<title[\s\S]*?<\/title>/gi, '').replace(/<desc[\s\S]*?<\/desc>/gi, '');
  if (opts.removeEditorAttrs) {
    // Remove Inkscape / Sodipodi / Illustrator / Adobe namespaces and their attributes
    svg = svg.replace(/\s(?:inkscape|sodipodi|dc|cc|rdf|i):[a-z-]+="[^"]*"/gi, '');
    svg = svg.replace(/\s(?:xmlns:inkscape|xmlns:sodipodi|xmlns:dc|xmlns:cc|xmlns:rdf|xmlns:i)="[^"]*"/gi, '');
    svg = svg.replace(/<(?:inkscape|sodipodi):[^>]*\/>/gi, '');
    svg = svg.replace(/<(?:inkscape|sodipodi):[^>]*>[\s\S]*?<\/(?:inkscape|sodipodi):[^>]*>/gi, '');
  }
  if (opts.collapseWhitespace) {
    // Collapse multiple spaces/newlines → single space (outside tag content)
    svg = svg.replace(/>\s+</g, '><');
    svg = svg.replace(/\s{2,}/g, ' ');
    svg = svg.trim();
  }

  return svg;
}

const DEFAULT_OPTS = {
  removeComments:    true,
  removeXmlDecl:     true,
  removeDoctypes:    true,
  removeMetadata:    true,
  removeTitleDesc:   false,
  removeEditorAttrs: true,
  collapseWhitespace: true,
};

const OPT_LABELS = {
  removeComments:    'Remove comments',
  removeXmlDecl:     'Remove <?xml?> declaration',
  removeDoctypes:    'Remove DOCTYPE',
  removeMetadata:    'Remove <metadata>',
  removeTitleDesc:   'Remove <title> and <desc>',
  removeEditorAttrs: 'Remove editor attributes (Inkscape, AI)',
  collapseWhitespace: 'Collapse whitespace',
};

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  return `${(n / 1024).toFixed(1)} KB`;
}

export default function SvgOptimizer() {
  const [input, setInput]   = useState('');
  const [opts, setOpts]     = useState(DEFAULT_OPTS);
  const fileRef             = useRef(null);

  useSEO({
    title: 'SVG Optimizer',
    description: 'Clean and minify SVG files online — remove comments, metadata, and whitespace. Free, instant, browser-based SVG optimizer.',
    keywords: ['svg optimizer', 'svg minifier', 'optimize svg', 'svgo online', 'clean svg file'],
    jsonLd: [
      buildToolSchema({ name: 'SVG Optimizer', description: 'Optimize and minify SVG files by removing comments, metadata, and whitespace', url: '/tools/svg-optimizer' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/svg-optimizer',
  });

  const optimized = useMemo(() => {
    if (!input.trim()) return '';
    return optimizeSvg(input, opts);
  }, [input, opts]);

  const origBytes = new TextEncoder().encode(input).length;
  const optBytes  = new TextEncoder().encode(optimized).length;
  const savings   = origBytes > 0 ? Math.round((1 - optBytes / origBytes) * 100) : 0;

  const toggleOpt = (key) => setOpts(prev => ({ ...prev, [key]: !prev[key] }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setInput(ev.target.result);
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownload = () => {
    const blob = new Blob([optimized], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'optimized.svg';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <ToolLayout
      title="SVG Optimizer"
      description="Clean and minify SVG files — remove comments, metadata, and whitespace to reduce file size."
      icon={<SvgOptimizerIcon className="w-6 h-6" />}
      category="Images"
      seoContent={seoContent}
    >
      {/* Options */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Optimisations</p>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-xs text-blue-600 hover:underline"
          >
            Upload .svg file
          </button>
          <input ref={fileRef} type="file" accept=".svg,image/svg+xml" className="hidden" onChange={handleFile} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
          {Object.entries(OPT_LABELS).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <div
                onClick={() => toggleOpt(key)}
                className={`relative w-8 h-4.5 rounded-full transition-colors flex-shrink-0 ${opts[key] ? 'bg-blue-600' : 'bg-gray-200'}`}
                style={{ width: '2rem', height: '1.1rem' }}
              >
                <span className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-white rounded-full shadow transition-transform ${opts[key] ? 'translate-x-3.5' : ''}`}
                  style={{ width: '0.85rem', height: '0.85rem' }} />
              </div>
              <span className="text-xs text-gray-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="card space-y-2">
        <label className="label">SVG Input</label>
        <textarea
          className="input font-mono text-xs resize-none"
          rows={10}
          placeholder="Paste SVG code here…"
          value={input}
          onChange={e => setInput(e.target.value)}
          spellCheck={false}
        />
      </div>

      {/* Output */}
      {optimized && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Optimised SVG</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {fmtBytes(origBytes)} → {fmtBytes(optBytes)}
                {savings > 0 && <span className="ml-1 text-green-600 font-semibold">−{savings}%</span>}
              </span>
              <ResultActions copyText={optimized} onDownload={handleDownload} downloadLabel="Download optimized.svg" />
            </div>
          </div>
          <textarea
            className="input font-mono text-xs resize-none bg-gray-900 text-green-400 rounded-xl"
            rows={10}
            readOnly
            value={optimized}
            spellCheck={false}
          />
          {/* SVG Preview */}
          <div>
            <p className="text-xs text-gray-400 mb-2">Preview</p>
            <div
              className="border border-gray-100 rounded-xl p-4 flex items-center justify-center min-h-24 bg-gray-50"
              dangerouslySetInnerHTML={{ __html: optimized }}
            />
          </div>
        </div>
      )}

      {!input.trim() && (
        <div className="card">
          <p className="text-xs text-gray-400 text-center py-2">Paste SVG code or upload an .svg file to optimise it.</p>
        </div>
      )}
    </ToolLayout>
  );
}
