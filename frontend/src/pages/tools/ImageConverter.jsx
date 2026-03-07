import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { ConvertImageIcon } from '../../components/common/Icons';
import { convertImage, downloadBlob, getFileSizes } from '../../services/toolsApi';
import { formatBytes } from '../../utils/formatters';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const FORMATS = [
  { value: 'jpeg', label: 'JPEG (.jpg)' },
  { value: 'png', label: 'PNG (.png)' },
  { value: 'webp', label: 'WebP (.webp)' },
  { value: 'avif', label: 'AVIF (.avif)' },
  { value: 'tiff', label: 'TIFF (.tiff)' },
];

const seoContent = {
  about: 'The Tooli Image Converter converts images between the most common web formats: JPEG, PNG, WebP, AVIF, and TIFF. It runs on a Sharp-powered server pipeline for professional-quality output with no artefacts or colour-profile errors.',
  howTo: [
    'Upload your image by clicking the drop zone or dragging a file.',
    'Select the target format from the format buttons (JPEG, PNG, WebP, AVIF, or TIFF).',
    'For lossy formats, adjust the Quality slider as needed.',
    'Click the Convert button and download the result.',
  ],
  features: [
    'Converts between JPEG, PNG, WebP, AVIF, and TIFF',
    'Adjustable quality for lossy formats',
    'Shows original vs output file size',
    'Handles ICC colour profiles correctly',
    'Supports any standard image as input',
    'Files deleted from server immediately after processing',
  ],
  faq: [
    { q: 'Why convert to WebP?', a: 'WebP produces 25–35% smaller files than JPEG at the same quality, and is supported by all modern browsers. It is the recommended format for web images.' },
    { q: 'What is AVIF?', a: 'AVIF is a next-generation image format based on AV1 video codec. It offers even better compression than WebP and supports HDR, but encoding is slower.' },
    { q: 'Will converting from JPEG to PNG make it lossless?', a: 'The PNG output will be lossless, but any compression artefacts already present in the JPEG source are baked in. Starting from a lossless source gives the best results.' },
  ],
};

export default function ImageConverter() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('webp');
  const [quality, setQuality] = useState(90);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useSEO({
    title: 'Image Format Converter',
    description: 'Convert images between JPG, PNG, WebP, AVIF formats online. Free and instant.',
    keywords: ['image converter', 'convert jpg to webp', 'convert png', 'webp converter', 'avif converter'],
    jsonLd: [buildToolSchema({ name: 'Image Format Converter', description: 'Convert images between JPG, PNG, WebP, AVIF online', url: '/tools/convert-image' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/convert-image',
  });

  const handleFile = (f) => { setFile(f); setResult(null); setError(''); };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const res = await convertImage(file, format, quality);
      const sizes = getFileSizes(res);
      setResult({
        blob: res,
        filename: `converted.${format}`,
        originalSize: file.size,
        outputSize: res.data.size,
        ...sizes,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Conversion failed. Try another file or format.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolLayout
      title="Image Converter"
      description="Convert images between JPG, PNG, WebP, and AVIF formats instantly."
      icon={<ConvertImageIcon className="w-6 h-6" />}
      category="Images"
      seoContent={seoContent}
    >
      <div className="card">
        <FileUpload
          accept="image/*"
          onFileSelect={handleFile}
          label="Click or drag image here"
          helpText="Any image format — max 10 MB"
          maxSize={10 * 1024 * 1024}
        />
        {file && <p className="mt-3 text-sm text-gray-500">{file.name} — {formatBytes(file.size)}</p>}
      </div>

      {file && (
        <div className="card space-y-4">
          <h3 className="font-semibold">Settings</h3>

          <div>
            <label className="label">Convert To</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FORMATS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    format === f.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 text-gray-600'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {format !== 'png' && format !== 'tiff' && (
            <div>
              <label className="label">Quality: <span className="text-blue-600 font-semibold">{quality}%</span></label>
              <input type="range" min={1} max={100} value={quality}
                onChange={e => setQuality(+e.target.value)} className="w-full accent-blue-600" />
            </div>
          )}

          <Button onClick={handleConvert} loading={loading} className="w-full" size="lg">
            Convert to {format.toUpperCase()}
          </Button>
        </div>
      )}

      {error && <Alert type="error" message={error} />}

      {result && (
        <div className="card bg-green-50 border-2 border-green-100">
          <div className="flex justify-between text-sm text-green-800 mb-3">
            <span>Original: {formatBytes(result.originalSize)}</span>
            <span>Output: {formatBytes(result.outputSize)}</span>
          </div>
          <Button onClick={() => downloadBlob(result.blob, result.filename)} className="w-full">
            ⬇ Download {format.toUpperCase()} File
          </Button>
        </div>
      )}
    </ToolLayout>
  );
}
