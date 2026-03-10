import { useState } from 'react';
import ImageToolLayout from '../../components/tools/ImageToolLayout';
import { CompressImageIcon } from '../../components/common/Icons';
import { compressImage } from '../../services/toolsApi';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: [
    'The Tooli Image Compressor reduces the file size of JPG, PNG, WebP, and AVIF images without a visible drop in quality. It uses a high-performance server-side Sharp pipeline to apply smart lossy or lossless compression depending on your quality setting.',
    'Reducing image sizes improves web page load speed, saves storage space, and reduces bandwidth costs. This tool is ideal for web developers optimising assets, bloggers preparing photos, and anyone who needs to send large images by email.',
  ],
  howTo: [
    'Click the upload area or drag your image file into it.',
    'Adjust the Quality slider — lower values produce smaller files, higher values keep more detail.',
    'Optionally select an Output Format to convert the image while compressing.',
    'Click "Compress Image" and download the result.',
  ],
  features: [
    'Supports JPG, PNG, WebP, GIF, and AVIF input formats',
    'Adjustable quality from 1–100%',
    'Optional format conversion on the same pass',
    'Shows exact file size reduction and savings percentage',
    'Server-side Sharp compression for maximum quality/size ratio',
    'Files are not stored — deleted immediately after processing',
  ],
  faq: [
    { q: 'Does compression reduce image quality?', a: 'At quality settings of 70–85% the reduction in quality is imperceptible to the human eye while saving 50–80% of file size. You can always increase quality if needed.' },
    { q: 'What is the maximum file size?', a: 'The maximum upload size is 10 MB per image.' },
    { q: 'Is my image stored on the server?', a: 'No. Images are processed in memory and the temporary file is deleted immediately after you download the result.' },
    { q: 'Which formats are supported?', a: 'You can upload JPG, PNG, WebP, GIF, AVIF, and TIFF. You can output JPG, PNG, WebP, or AVIF.' },
  ],
};

export default function ImageCompressor() {
  const [quality, setQuality] = useState(80);
  const [format, setFormat]   = useState('');

  useSEO({
    title: 'Image Compressor',
    description: 'Compress JPG, PNG, WebP images online for free. Reduce file size without losing quality.',
    keywords: ['image compressor', 'reduce image size', 'compress jpg', 'compress png', 'webp compressor'],
    jsonLd: [
      buildToolSchema({ name: 'Image Compressor', description: 'Compress images online for free', category: 'UtilitiesApplication', url: '/tools/compress-image' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/compress-image',
  });

  async function handleProcess(file) {
    const res  = await compressImage(file, quality, format || undefined);
    const blob = res.data;
    const ext  = format || file.name.split('.').pop();
    return {
      blob,
      format: ext,
      originalSize: file.size,
      resultSize:   blob.size,
      savedPct:     Math.round((1 - blob.size / file.size) * 100),
    };
  }

  const controlsSlot = (
    <>
      <div>
        <label className="label">Quality: <span className="text-blue-600 font-semibold">{quality}%</span></label>
        <input
          type="range" min={1} max={100} value={quality}
          onChange={e => setQuality(+e.target.value)}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Smaller file</span><span>Better quality</span>
        </div>
      </div>
      <div>
        <label className="label">Output Format</label>
        <select value={format} onChange={e => setFormat(e.target.value)} className="input">
          <option value="">Same as input</option>
          <option value="jpeg">JPEG</option>
          <option value="png">PNG</option>
          <option value="webp">WebP</option>
          <option value="avif">AVIF</option>
        </select>
      </div>
    </>
  );

  return (
    <ImageToolLayout
      title="Image Compressor"
      description="Reduce image file size without losing quality. Supports JPG, PNG, WebP, and AVIF."
      icon={<CompressImageIcon className="w-6 h-6" />}
      category="Images"
      seoContent={seoContent}
      onProcess={handleProcess}
      processLabel="Compress Image"
      controlsSlot={controlsSlot}
      downloadName="compressed"
      showEditor={false}
      showFilters={false}
    />
  );
}
