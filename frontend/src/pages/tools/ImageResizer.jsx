import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { ResizeImageIcon } from '../../components/common/Icons';
import { resizeImage, downloadBlob } from '../../services/toolsApi';
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
  const [file, setFile] = useState(null);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [fit, setFit] = useState('cover');
  const [format, setFormat] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useSEO({
    title: 'Image Resizer',
    description: 'Resize images online to any dimension. Maintain aspect ratio. Supports JPG, PNG, WebP.',
    keywords: ['image resizer', 'resize image', 'change image size', 'scale image online'],
    jsonLd: [buildToolSchema({ name: 'Image Resizer', description: 'Resize images to exact dimensions online', url: '/tools/resize-image' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/resize-image',
  });

  const handleFile = (f) => { setFile(f); setResult(null); setError(''); };

  const handleResize = async () => {
    if (!file || (!width && !height)) return;
    setLoading(true);
    setError('');
    try {
      const res = await resizeImage(file, { width: width || undefined, height: height || undefined, fit, format: format || undefined });
      const ext = format || file.name.split('.').pop();
      const fw = res.headers['x-width'];
      const fh = res.headers['x-height'];
      setResult({ blob: res, filename: `resized.${ext}`, width: fw, height: fh });
    } catch (err) {
      setError(err.response?.data?.message || 'Resize failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Image Resizer"
      description="Resize images to exact dimensions. Supports JPG, PNG, WebP."
      icon={<ResizeImageIcon className="w-6 h-6" />}
      category="Images"
      seoContent={seoContent}
    >
      <div className="card">
        <FileUpload
          accept="image/*"
          onFileSelect={handleFile}
          label="Click or drag image here"
          helpText="JPG, PNG, WebP — max 10 MB"
          maxSize={10 * 1024 * 1024}
          disabled={loading}
        />
        {file && (
          <p className="mt-3 text-sm text-gray-500">{file.name} selected</p>
        )}
      </div>

      {file && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Dimensions</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Width (px)</label>
              <input
                type="number"
                min={1}
                className="input"
                value={width}
                onChange={e => setWidth(e.target.value)}
                placeholder="e.g. 1280"
              />
            </div>
            <div>
              <label className="label">Height (px)</label>
              <input
                type="number"
                min={1}
                className="input"
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="e.g. 720"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">Leave one field empty to resize proportionally.</p>

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

          <Button onClick={handleResize} loading={loading} className="w-full" size="lg"
            disabled={!width && !height}>
            Resize Image
          </Button>
        </div>
      )}

      {error && <Alert type="error" message={error} />}

      {result && (
        <div className="card bg-green-50 border-2 border-green-100">
          <p className="font-bold text-green-800 mb-2">✅ Resized to {result.width} × {result.height} px</p>
          <Button onClick={() => downloadBlob(result.blob, result.filename)} className="w-full">
            ⬇ Download Resized Image
          </Button>
        </div>
      )}
    </ToolLayout>
  );
}
