import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { AspectRatioIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Aspect Ratio Calculator helps you maintain proportional dimensions when resizing images, videos, or UI elements. Enter any two values and get the third automatically. It also shows the simplified ratio (e.g. 16:9) and equivalent sizes at common resolutions.',
  howTo: [
    'Enter width and height to calculate the aspect ratio.',
    'Or enter one dimension and the ratio to calculate the missing dimension.',
    'Click a preset ratio (16:9, 4:3, 1:1, etc.) to set the ratio instantly.',
    'Enter a target width or height to see the proportionally scaled result.',
  ],
  features: [
    'Calculate ratio from width and height',
    'Scale to any target dimension while maintaining ratio',
    'Common presets: 16:9, 4:3, 3:2, 1:1, 21:9, 9:16, 4:5',
    'Shows simplified ratio (e.g. 1920:1080 → 16:9)',
    'Visual preview box scales to show the ratio proportionally',
    'Pixel and percentage output',
  ],
  faq: [
    { q: 'What is an aspect ratio?', a: 'An aspect ratio describes the proportional relationship between width and height. A 16:9 ratio means for every 16 units of width there are 9 units of height. It stays the same regardless of the actual pixel dimensions.' },
    { q: 'What aspect ratio should I use for video?', a: '16:9 is the standard for YouTube, Vimeo, and most modern displays (widescreen HD). 9:16 is used for vertical video (TikTok, Instagram Reels, YouTube Shorts). 4:3 is the older TV standard.' },
    { q: 'What aspect ratio for social media images?', a: 'Instagram feed posts: 1:1 (square) or 4:5 (portrait). Facebook link previews: 1.91:1. Twitter/X cards: 2:1. Open Graph images: 1.91:1 (1200×630px).' },
  ],
};

const PRESETS = [
  { label: '16:9',  w: 16, h: 9  },
  { label: '4:3',   w: 4,  h: 3  },
  { label: '3:2',   w: 3,  h: 2  },
  { label: '1:1',   w: 1,  h: 1  },
  { label: '21:9',  w: 21, h: 9  },
  { label: '9:16',  w: 9,  h: 16 },
  { label: '4:5',   w: 4,  h: 5  },
  { label: '2:1',   w: 2,  h: 1  },
];

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function simplifyRatio(w, h) {
  if (!w || !h || isNaN(w) || isNaN(h)) return null;
  const d = gcd(Math.round(w), Math.round(h));
  return { w: Math.round(w) / d, h: Math.round(h) / d };
}

export default function AspectRatio() {
  const [width, setWidth]   = useState('1920');
  const [height, setHeight] = useState('1080');
  const [targetW, setTargetW] = useState('');
  const [targetH, setTargetH] = useState('');

  useSEO({
    title: 'Aspect Ratio Calculator',
    description: 'Calculate and maintain image or video aspect ratios. Scale dimensions, check ratios, use common presets like 16:9 and 4:3.',
    keywords: ['aspect ratio calculator', 'image aspect ratio', 'video aspect ratio', '16:9 calculator', 'resize proportionally'],
    jsonLd: [
      buildToolSchema({ name: 'Aspect Ratio Calculator', description: 'Calculate and maintain proportional dimensions', url: '/tools/aspect-ratio' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/aspect-ratio',
  });

  const w = parseFloat(width);
  const h = parseFloat(height);
  const ratio = useMemo(() => simplifyRatio(w, h), [w, h]);
  const ratioDecimal = (!isNaN(w) && !isNaN(h) && h !== 0) ? (w / h).toFixed(4) : null;

  const scaledH = useMemo(() => {
    if (!targetW || isNaN(parseFloat(targetW)) || isNaN(w) || isNaN(h) || h === 0) return '';
    return Math.round((parseFloat(targetW) * h) / w).toString();
  }, [targetW, w, h]);

  const scaledW = useMemo(() => {
    if (!targetH || isNaN(parseFloat(targetH)) || isNaN(w) || isNaN(h) || w === 0) return '';
    return Math.round((parseFloat(targetH) * w) / h).toString();
  }, [targetH, w, h]);

  const applyPreset = (pw, ph) => {
    setWidth(pw.toString());
    setHeight(ph.toString());
    setTargetW('');
    setTargetH('');
  };

  const previewW = 200;
  const previewH = (!isNaN(w) && !isNaN(h) && w !== 0) ? Math.round((200 * h) / w) : 113;
  const clampedH = Math.min(Math.max(previewH, 40), 200);

  return (
    <ToolLayout
      title="Aspect Ratio Calculator"
      description="Calculate, scale, and maintain aspect ratios for images, videos, and UI elements."
      icon={<AspectRatioIcon className="w-6 h-6" />}
      category="Utility"
      seoContent={seoContent}
    >
      {/* Presets */}
      <div className="card py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 mr-1">Presets:</span>
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.w, p.h)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-lg font-medium transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-5">
        {/* Dimensions input */}
        <div>
          <label className="label">Original Dimensions</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              className="input"
              value={width}
              onChange={e => setWidth(e.target.value)}
              placeholder="Width"
              min={1}
            />
            <span className="text-gray-400 font-medium shrink-0">×</span>
            <input
              type="number"
              className="input"
              value={height}
              onChange={e => setHeight(e.target.value)}
              placeholder="Height"
              min={1}
            />
          </div>
        </div>

        {/* Ratio display */}
        {ratio && (
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <div className="font-bold text-blue-800 text-lg">{ratio.w}:{ratio.h}</div>
              <div className="text-blue-500 text-xs mt-0.5">Simplified ratio</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
              <div className="font-bold text-gray-800 text-lg">{ratioDecimal}</div>
              <div className="text-gray-400 text-xs mt-0.5">Decimal (w/h)</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-center">
              <div
                className="bg-blue-200 border-2 border-blue-400 rounded"
                style={{ width: `${previewW * 0.6}px`, height: `${clampedH * 0.6}px` }}
                title={`${ratio.w}:${ratio.h} preview`}
              />
            </div>
          </div>
        )}

        {/* Scale calculator */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <p className="text-sm font-semibold text-gray-700">Scale to target dimension</p>
          <div>
            <label className="label">Target Width → calculates Height</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                className="input"
                value={targetW}
                onChange={e => { setTargetW(e.target.value); setTargetH(''); }}
                placeholder="e.g. 1280"
                min={1}
              />
              <span className="text-gray-400 shrink-0">→</span>
              <input
                readOnly
                className="input bg-gray-50 font-mono"
                value={scaledH}
                placeholder="Height"
              />
            </div>
          </div>
          <div>
            <label className="label">Target Height → calculates Width</label>
            <div className="flex items-center gap-3">
              <input
                readOnly
                className="input bg-gray-50 font-mono"
                value={scaledW}
                placeholder="Width"
              />
              <span className="text-gray-400 shrink-0">←</span>
              <input
                type="number"
                className="input"
                value={targetH}
                onChange={e => { setTargetH(e.target.value); setTargetW(''); }}
                placeholder="e.g. 720"
                min={1}
              />
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
