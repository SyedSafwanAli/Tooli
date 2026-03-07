import { useState, useCallback } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import Button from '../../components/common/Button';
import { ColorConverterIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

// Conversion utilities
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
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
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

const seoContent = {
  about: 'The Tooli Color Converter converts colours between the three most common CSS formats: HEX (#rrggbb), RGB (red, green, blue), and HSL (hue, saturation, lightness). All formats update in real time as you edit any value, and you can use the native colour picker for visual selection.',
  howTo: [
    'Use the colour picker to select a colour visually.',
    'Or type a HEX value (e.g. #2563eb) into the HEX input.',
    'Or enter individual R, G, B channel values (0–255).',
    'Or enter H (0–360), S (0–100%), L (0–100%) values.',
    'All three formats update instantly. Click "Copy" next to any format to copy the value.',
  ],
  features: [
    'Converts between HEX, RGB, and HSL',
    'Live colour preview swatch',
    'Native browser colour picker integration',
    'One-click copy of each format',
    'Instant bi-directional conversion',
    'Runs entirely in your browser',
  ],
  faq: [
    { q: 'What is HEX colour?', a: 'HEX is a base-16 representation of RGB values, written as #RRGGBB. For example, #ff0000 is pure red. It is the most common format used in CSS and HTML.' },
    { q: 'What is HSL?', a: 'HSL stands for Hue, Saturation, Lightness. It is more intuitive than RGB for design work because hue changes colour, saturation controls intensity, and lightness controls brightness.' },
    { q: 'Can I use this for Tailwind CSS colours?', a: 'Yes. Tailwind uses HEX and RGB values. You can look up a Tailwind colour on their documentation, then paste it here to get the RGB or HSL equivalent.' },
  ],
};

export default function ColorConverter() {
  const [hex, setHex] = useState('#2563eb');
  const [rgb, setRgb] = useState({ r: 37, g: 99, b: 235 });
  const [hsl, setHsl] = useState({ h: 221, s: 83, l: 53 });
  const [copied, setCopied] = useState('');

  useSEO({
    title: 'Color Converter',
    description: 'Convert colors between HEX, RGB, and HSL. Live color picker included.',
    keywords: ['color converter', 'hex to rgb', 'rgb to hsl', 'color picker', 'css color converter'],
    jsonLd: [buildToolSchema({ name: 'Color Converter', description: 'Convert colors between HEX, RGB, and HSL online', url: '/tools/color-converter' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/color-converter',
  });

  const updateFromHex = useCallback((h) => {
    if (!/^#[0-9A-Fa-f]{6}$/.test(h)) return;
    const r = hexToRgb(h);
    setHex(h);
    setRgb(r);
    setHsl(rgbToHsl(r.r, r.g, r.b));
  }, []);

  const updateFromRgb = useCallback((r, g, b) => {
    const newRgb = { r: parseInt(r) || 0, g: parseInt(g) || 0, b: parseInt(b) || 0 };
    setRgb(newRgb);
    const h = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setHex(h);
    setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
  }, []);

  const updateFromHsl = useCallback((h, s, l) => {
    const nh = parseInt(h) || 0, ns = parseInt(s) || 0, nl = parseInt(l) || 0;
    setHsl({ h: nh, s: ns, l: nl });
    const r = hslToRgb(nh, ns, nl);
    setRgb(r);
    setHex(rgbToHex(r.r, r.g, r.b));
  }, []);

  const copy = async (text, label) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const hexStr = hex;
  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert between HEX, RGB, and HSL color formats."
      icon={<ColorConverterIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      {/* Color preview */}
      <div className="card">
        <div className="h-28 rounded-xl mb-4 transition-colors" style={{ backgroundColor: hex }} />

        <div className="flex items-center gap-3">
          <input
            type="color"
            value={hex}
            onChange={e => updateFromHex(e.target.value)}
            className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
          />
          <span className="text-sm text-gray-500">Use the color picker or enter values below</span>
        </div>
      </div>

      {/* HEX */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <label className="font-semibold text-sm">HEX</label>
          <button onClick={() => copy(hexStr, 'hex')}
            className="text-xs text-blue-600 hover:underline">
            {copied === 'hex' ? '✅ Copied!' : 'Copy'}
          </button>
        </div>
        <input
          type="text"
          value={hex}
          onChange={e => updateFromHex(e.target.value)}
          className="input font-mono uppercase"
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      {/* RGB */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <label className="font-semibold text-sm">RGB</label>
          <button onClick={() => copy(rgbStr, 'rgb')}
            className="text-xs text-blue-600 hover:underline">
            {copied === 'rgb' ? '✅ Copied!' : `Copy: ${rgbStr}`}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {['r', 'g', 'b'].map(ch => (
            <div key={ch}>
              <label className="text-xs text-gray-500 uppercase mb-1 block">{ch}</label>
              <input
                type="number" min={0} max={255}
                value={rgb[ch]}
                onChange={e => updateFromRgb(
                  ch === 'r' ? e.target.value : rgb.r,
                  ch === 'g' ? e.target.value : rgb.g,
                  ch === 'b' ? e.target.value : rgb.b,
                )}
                className="input text-center font-mono"
              />
            </div>
          ))}
        </div>
      </div>

      {/* HSL */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <label className="font-semibold text-sm">HSL</label>
          <button onClick={() => copy(hslStr, 'hsl')}
            className="text-xs text-blue-600 hover:underline">
            {copied === 'hsl' ? '✅ Copied!' : `Copy: ${hslStr}`}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['h', 'Hue', 360], ['s', 'Sat %', 100], ['l', 'Light %', 100]].map(([ch, label, max]) => (
            <div key={ch}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input
                type="number" min={0} max={max}
                value={hsl[ch]}
                onChange={e => updateFromHsl(
                  ch === 'h' ? e.target.value : hsl.h,
                  ch === 's' ? e.target.value : hsl.s,
                  ch === 'l' ? e.target.value : hsl.l,
                )}
                className="input text-center font-mono"
              />
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
