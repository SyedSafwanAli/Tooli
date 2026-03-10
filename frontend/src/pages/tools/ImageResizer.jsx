import { useState } from 'react';
import ImageToolLayout from '../../components/tools/ImageToolLayout';
import { ResizeImageIcon } from '../../components/common/Icons';
import { resizeImage } from '../../services/toolsApi';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Image Resizer lets you change the width and height of any image to exact pixel dimensions. It uses Sharp on the server for high-quality Lanczos resampling, so resized images look sharp and clean — not blurry or pixelated.',
  howTo: [
    'Upload your image by clicking the drop zone or dragging a file in.',
    'Enter the desired Width and/or Height in pixels. Leave one empty to resize proportionally.',
    'Choose a Fit Mode to control how the image fills the target dimensions.',
    'Optionally pick an output format, then click "Resize Image".',
    'Download the resized image using the button that appears.',
  ],
  features: [
    'Resize to exact pixel dimensions',
    'Proportional resize — leave one dimension blank',
    'Multiple fit modes: cover, contain, fill, inside, outside',
    'Optional format conversion (JPG, PNG, WebP)',
    'Output dimensions shown after processing',
    'Max 10 MB input file size',
  ],
  faq: [
    { q: 'Can I resize without distorting the image?', a: 'Yes. Leave either Width or Height blank and the tool will calculate the other dimension to maintain the original aspect ratio.' },
    { q: 'What is the difference between fit modes?', a: '"Cover" crops to fill the target box. "Contain" fits the whole image inside the box with letterboxing. "Fill" stretches to exact dimensions.' },
    { q: 'Will resizing increase file size?', a: 'Resizing to a larger size than the original may increase file size. Resizing to a smaller size typically reduces it.' },
  ],
};

export default function ImageResizer() {
  const [width, setWidth]   = useState('');
  const [height, setHeight] = useState('');
  const [fit, setFit]       = useState('cover');
  const [format, setFormat] = useState('');

  useSEO({
    title: 'Image Resizer',
    description: 'Resize images online to any dimension. Maintain aspect ratio. Supports JPG, PNG, WebP.',
    keywords: ['image resizer', 'resize image', 'change image size', 'scale image online'],
    jsonLd: [
      buildToolSchema({ name: 'Image Resizer', description: 'Resize images to exact dimensions online', url: '/tools/resize-image' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/resize-image',
  });

  async function handleProcess(file) {
    if (!width && !height) throw new Error('Enter at least one dimension (Width or Height).');
    const res  = await resizeImage(file, { width: width || undefined, height: height || undefined, fit, format: format || undefined });
    const blob = res.data;
    const ext  = format || file.name.split('.').pop();
    const fw   = res.headers['x-width'];
    const fh   = res.headers['x-height'];
    return {
      blob,
      format: ext,
      dimensions: fw && fh ? `${fw} × ${fh} px` : undefined,
      originalSize: file.size,
      resultSize:   blob.size,
      savedPct:     Math.max(0, Math.round((1 - blob.size / file.size) * 100)),
    };
  }

  const controlsSlot = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Width (px)</label>
          <input type="number" min={1} className="input" value={width}
            onChange={e => setWidth(e.target.value)} placeholder="e.g. 1280" />
        </div>
        <div>
          <label className="label">Height (px)</label>
          <input type="number" min={1} className="input" value={height}
            onChange={e => setHeight(e.target.value)} placeholder="e.g. 720" />
        </div>
      </div>
      <p className="text-xs text-gray-400">Leave one field empty to resize proportionally.</p>
      <div>
        <label className="label">Fit Mode</label>
        <select className="input" value={fit} onChange={e => setFit(e.target.value)}>
          <option value="cover">Cover (crop to fill)</option>
          <option value="contain">Contain (fit inside)</option>
          <option value="fill">Fill (stretch)</option>
          <option value="inside">Inside (don't enlarge)</option>
          <option value="outside">Outside</option>
        </select>
      </div>
      <div>
        <label className="label">Output Format</label>
        <select className="input" value={format} onChange={e => setFormat(e.target.value)}>
          <option value="">Same as input</option>
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
        </select>
      </div>
    </>
  );

  return (
    <ImageToolLayout
      title="Image Resizer"
      description="Resize images to exact dimensions. Supports JPG, PNG, WebP."
      icon={<ResizeImageIcon className="w-6 h-6" />}
      category="Images"
      seoContent={seoContent}
      onProcess={handleProcess}
      processLabel="Resize Image"
      controlsSlot={controlsSlot}
      downloadName="resized"
      showEditor={false}
      showFilters={false}
    />
  );
}
