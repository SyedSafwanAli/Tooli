import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { ColorPaletteIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Color Palette Generator creates harmonious colour palettes from any base colour you choose. Select a palette type — complementary, analogous, triadic, tetradic, split-complementary, or monochromatic — and instantly see the matching swatches. Every colour is shown in HEX, RGB, and HSL formats.',
  howTo: [
    'Click the colour swatch or type a HEX code in the input field to set your base colour.',
    'Choose a palette type from the options: Complementary, Analogous, Triadic, Tetradic, Split-Complementary, or Monochromatic.',
    'Click any swatch to copy its HEX code to your clipboard.',
    'Use "Copy CSS" to copy all colours as CSS custom properties.',
    'Use "Download PNG" to save the palette as an image strip.',
  ],
  features: [
    '6 palette types: Complementary, Analogous, Triadic, Tetradic, Split-Complementary, Monochromatic',
    'HEX, RGB, and HSL values shown per swatch',
    'Click any swatch to copy its HEX code instantly',
    'Export palette as CSS custom properties (--color-1: #hex)',
    'Download palette as PNG strip via Canvas API',
    'No external libraries — pure browser colour math',
    'Works offline after initial page load',
  ],
  faq: [
    { q: 'What is a complementary colour palette?', a: 'Complementary colours sit opposite each other on the colour wheel (e.g. blue and orange). They create maximum contrast and visual interest, ideal for call-to-action buttons and highlighting.' },
    { q: 'What is an analogous colour palette?', a: 'Analogous colours are adjacent on the colour wheel. They are naturally harmonious and are commonly used for backgrounds and gradients to create a calm, cohesive feel.' },
    { q: 'When should I use a triadic palette?', a: 'Triadic palettes use three colours equally spaced around the colour wheel. They offer strong visual contrast while remaining balanced — suitable for logos, illustrations, and playful UI designs.' },
    { q: 'How do I use the CSS export?', a: 'The CSS export produces CSS custom properties (variables) that you can paste directly into your :root block. Reference them as var(--color-1), var(--color-2), etc. throughout your stylesheet.' },
  ],
};

const PALETTE_TYPES = [
  { id: 'complementary',      label: 'Complementary',      count: 2 },
  { id: 'analogous',          label: 'Analogous',          count: 5 },
  { id: 'triadic',            label: 'Triadic',            count: 3 },
  { id: 'tetradic',           label: 'Tetradic',           count: 4 },
  { id: 'split-complementary', label: 'Split-Comp',        count: 3 },
  { id: 'monochromatic',      label: 'Monochromatic',      count: 5 },
];

// ─── Colour math ──────────────────────────────────────────────────────────────

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return '#' + [f(0), f(8), f(4)]
    .map(x => Math.round(x * 255).toString(16).padStart(2, '0'))
    .join('');
}

function hslToRgb(h, s, l) {
  const hex = hslToHex(h, s, l);
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function generatePalette(hex, type) {
  const [h, s, l] = hexToHsl(hex);
  switch (type) {
    case 'complementary':
      return [0, 180].map(o => hslToHex((h + o) % 360, s, l));
    case 'analogous':
      return [-60, -30, 0, 30, 60].map(o => hslToHex((h + o + 360) % 360, s, l));
    case 'triadic':
      return [0, 120, 240].map(o => hslToHex((h + o) % 360, s, l));
    case 'tetradic':
      return [0, 90, 180, 270].map(o => hslToHex((h + o) % 360, s, l));
    case 'split-complementary':
      return [0, 150, 210].map(o => hslToHex((h + o) % 360, s, l));
    case 'monochromatic': {
      const levels = [15, 30, l, Math.min(l + 25, 85), Math.min(l + 45, 95)];
      return levels.map(newL => hslToHex(h, s, newL));
    }
    default:
      return [hex];
  }
}

function isLight(hex) {
  const [r, g, b] = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState('#3b82f6');
  const [hexInput, setHexInput] = useState('#3b82f6');
  const [paletteType, setPaletteType] = useState('analogous');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [cssCopied, setCssCopied] = useState(false);

  useSEO({
    title: 'Color Palette Generator',
    description: 'Generate harmonious colour palettes online. Complementary, analogous, triadic, tetradic and more. Export as CSS variables or PNG.',
    keywords: ['color palette generator', 'colour palette', 'complementary colors', 'analogous colors', 'color scheme', 'css colors'],
    jsonLd: [
      buildToolSchema({ name: 'Color Palette Generator', description: 'Generate harmonious colour palettes from any base colour', url: '/tools/color-palette' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/color-palette',
  });

  const palette = useMemo(() => generatePalette(baseColor, paletteType), [baseColor, paletteType]);

  const handleHexInput = (val) => {
    setHexInput(val);
    if (/^#[0-9a-fA-F]{6}$/.test(val)) setBaseColor(val);
  };

  const handleColorPicker = (val) => {
    setBaseColor(val);
    setHexInput(val);
  };

  const copySwatch = async (hex, i) => {
    await navigator.clipboard.writeText(hex);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const copyCss = async () => {
    const css = `:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
    await navigator.clipboard.writeText(css);
    setCssCopied(true);
    setTimeout(() => setCssCopied(false), 2000);
  };

  const downloadPng = () => {
    const size = 120;
    const canvas = document.createElement('canvas');
    canvas.width = palette.length * size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    palette.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.fillRect(i * size, 0, size, size);
    });
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `palette-${paletteType}.png`;
    a.click();
  };

  const hexStr = (hex) => hex.toUpperCase();
  const rgbStr = (hex) => {
    const [h, s, l] = hexToHsl(hex);
    const [r, g, b] = hslToRgb(h, s, l);
    return `rgb(${r}, ${g}, ${b})`;
  };
  const hslStr = (hex) => {
    const [h, s, l] = hexToHsl(hex);
    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  return (
    <ToolLayout
      title="Color Palette Generator"
      description="Generate harmonious colour palettes from any base colour. Export as CSS variables or PNG."
      icon={<ColorPaletteIcon className="w-6 h-6" />}
      category="Utility"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Base colour picker */}
        <div>
          <label className="label">Base Colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={baseColor}
              onChange={e => handleColorPicker(e.target.value)}
              className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 bg-white"
              title="Pick base colour"
            />
            <input
              type="text"
              value={hexInput}
              onChange={e => handleHexInput(e.target.value)}
              placeholder="#3b82f6"
              maxLength={7}
              className="input font-mono w-36"
            />
            <span className="text-xs text-gray-400 hidden sm:block">{rgbStr(baseColor)}</span>
          </div>
        </div>

        {/* Palette type */}
        <div>
          <label className="label">Palette Type</label>
          <div className="flex flex-wrap gap-2">
            {PALETTE_TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setPaletteType(t.id)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  paletteType === t.id
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                {t.label}
                <span className="ml-1 text-xs opacity-60">{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Palette swatches */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm capitalize">{paletteType} Palette</h3>
          <div className="flex gap-2">
            <button
              onClick={copyCss}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 font-medium transition-colors"
            >
              {cssCopied ? '✓ Copied CSS' : 'Copy CSS'}
            </button>
            <button
              onClick={downloadPng}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 font-medium transition-colors"
            >
              Download PNG
            </button>
          </div>
        </div>

        {/* Large swatches */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200" style={{ height: '120px' }}>
          {palette.map((hex, i) => (
            <button
              key={i}
              style={{ backgroundColor: hex, flex: 1 }}
              onClick={() => copySwatch(hex, i)}
              title={`Click to copy ${hex}`}
              className="relative group transition-all hover:flex-[1.3]"
            >
              <span className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold ${isLight(hex) ? 'text-gray-800' : 'text-white'}`}>
                {copiedIndex === i ? 'Copied!' : hexStr(hex)}
              </span>
            </button>
          ))}
        </div>

        {/* Swatch details */}
        <div className={`grid gap-3 ${palette.length <= 3 ? 'grid-cols-3' : palette.length === 4 ? 'sm:grid-cols-4 grid-cols-2' : 'sm:grid-cols-5 grid-cols-2 sm:grid-cols-3'}`}>
          {palette.map((hex, i) => {
            const [h, s, l] = hexToHsl(hex);
            return (
              <button
                key={i}
                onClick={() => copySwatch(hex, i)}
                className="group text-left rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div style={{ backgroundColor: hex, height: '56px' }} />
                <div className="p-2 bg-white space-y-0.5">
                  <p className="font-mono text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {copiedIndex === i ? '✓ Copied!' : hexStr(hex)}
                  </p>
                  <p className="font-mono text-xs text-gray-400">hsl({h},{s}%,{l}%)</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CSS preview */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">CSS Variables</h3>
          <button
            onClick={copyCss}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-blue-600 hover:border-blue-300 font-medium"
          >
            {cssCopied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre className="text-xs font-mono bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-x-auto text-gray-700 leading-relaxed">
          {`:root {\n${palette.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`}
        </pre>
      </div>
    </ToolLayout>
  );
}
