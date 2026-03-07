import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { CompressImageIcon } from '../../components/common/Icons';
import { compressImage, downloadBlob, getFileSizes } from '../../services/toolsApi';
import { formatBytes, savings } from '../../utils/formatters';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';
import ImageResultPreview from '../../components/common/ImageResultPreview';
import ResultActions from '../../components/common/ResultActions';

const seoContent = {
  about: [
    'The Tooli Image Compressor reduces the file size of JPG, PNG, WebP, and AVIF images without a visible drop in quality. It uses a high-performance server-side Sharp pipeline to apply smart lossy or lossless compression depending on your quality setting.',
    'Reducing image sizes improves web page load speed, saves storage space, and reduces bandwidth costs. This tool is ideal for web developers optimising assets, bloggers preparing photos, and anyone who needs to send large images by email.',
  ],
  howTo: [
    'Click the upload area or drag your image file into it.',
    'Adjust the Quality slider — lower values produce smaller files, higher values keep more detail.',
    'Optionally select an Output Format to convert the image while compressing.',
    'Click "Compress Image" and wait a moment for the server to process.',
    'Click "Download Compressed Image" to save the result.',
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
  const [file, setFile] = useState(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  useSEO({
    title: 'Image Compressor',
    description: 'Compress JPG, PNG, WebP images online for free. Reduce file size without losing quality.',
    keywords: ['image compressor', 'reduce image size', 'compress jpg', 'compress png', 'webp compressor'],
    jsonLd: [buildToolSchema({ name: 'Image Compressor', description: 'Compress images online for free', category: 'UtilitiesApplication', url: '/tools/compress-image' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/compress-image',
  });

  const handleFile = (f) => {
    setFile(f);
    setResult(null);
    setError('');
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await compressImage(file, quality, format || undefined);
      const sizes = getFileSizes(res);
      const ext = format || file.name.split('.').pop();
      setResult({
        blob: res,
        filename: `compressed.${ext}`,
        ...sizes,
        originalSize: file.size,
        compressedSize: res.data.size,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Compression failed. Please try another file.');
    } finally {
      setLoading(false);
    }
  };

  const saved = result ? savings(result.originalSize, result.compressedSize) : null;

  return (
    <ToolLayout
      title="Image Compressor"
      description="Reduce image file size without losing quality. Supports JPG, PNG, WebP, and AVIF."
      icon={<CompressImageIcon className="w-6 h-6" />}
      category="Images"
      seoContent={seoContent}
    >
      {/* Upload */}
      <div className="card">
        <FileUpload
          accept="image/*"
          onFileSelect={handleFile}
          label="Click or drag your image here"
          helpText="Supports JPG, PNG, WebP, GIF, AVIF — max 10 MB"
          maxSize={10 * 1024 * 1024}
          disabled={loading}
        />

        {preview && (
          <div className="mt-4 flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
            <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
            <div className="text-sm">
              <p className="font-medium text-gray-800">{file.name}</p>
              <p className="text-gray-500">{formatBytes(file.size)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Settings */}
      {file && (
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Settings</h3>

          <div>
            <label className="label">Quality: <span className="text-blue-600 font-semibold">{quality}%</span></label>
            <input
              type="range"
              min={1}
              max={100}
              value={quality}
              onChange={e => setQuality(+e.target.value)}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>

          <div>
            <label className="label">Output Format (optional)</label>
            <select value={format} onChange={e => setFormat(e.target.value)} className="input">
              <option value="">Same as input</option>
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
              <option value="avif">AVIF</option>
            </select>
          </div>

          <Button onClick={handleCompress} loading={loading} size="lg" className="w-full">
            {loading ? 'Compressing...' : 'Compress Image'}
          </Button>
        </div>
      )}

      {/* Error */}
      {error && <Alert type="error" message={error} />}

      {/* Result */}
      {result && (
        <>
          <div className="card border-2 border-green-100 bg-green-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-green-800">Compression Complete</h3>
                <p className="text-sm text-green-700">
                  Saved <span className="font-bold">{saved}%</span> — {formatBytes(result.originalSize)} &rarr; {formatBytes(result.compressedSize)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-sm mb-4">
              <div className="bg-white rounded-lg p-2">
                <div className="font-bold text-gray-700">{formatBytes(result.originalSize)}</div>
                <div className="text-gray-400 text-xs">Original</div>
              </div>
              <div className="bg-white rounded-lg p-2">
                <div className="font-bold text-green-600">{formatBytes(result.compressedSize)}</div>
                <div className="text-gray-400 text-xs">Compressed</div>
              </div>
              <div className="bg-white rounded-lg p-2">
                <div className="font-bold text-blue-600">{saved}%</div>
                <div className="text-gray-400 text-xs">Saved</div>
              </div>
            </div>

            <ResultActions
              onDownload={() => downloadBlob(result.blob, result.filename)}
              downloadLabel="Download Compressed Image"
              shareData={{ title: 'Compressed Image', text: `Compressed with Tooli — saved ${saved}%`, url: 'https://tooli.app/tools/compress-image' }}
            />
          </div>

          <ImageResultPreview
            originalFile={file}
            resultBlob={result.blob.data}
            originalSize={result.originalSize}
            resultSize={result.compressedSize}
            savedPct={saved}
          />
        </>
      )}
    </ToolLayout>
  );
}
