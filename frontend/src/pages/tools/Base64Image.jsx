import { useState, useCallback } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import FileUpload from '../../components/common/FileUpload';
import ResultActions from '../../components/common/ResultActions';
import { Base64ImageIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Base64 Image Encoder converts images to Base64 data URIs and decodes Base64 strings back to viewable images. Use it to embed images directly in HTML/CSS, test API payloads, or preview encoded image data. Everything runs locally in your browser.',
  howTo: [
    'In Encode mode: upload an image file. The Base64 data URI appears instantly.',
    'Copy the result with the copy button, or use it directly in HTML as an <img> src.',
    'In Decode mode: paste a Base64 data URI (starting with data:image/…) into the text area.',
    'The decoded image preview appears below the input.',
  ],
  features: [
    'Encode any image (JPEG, PNG, GIF, WEBP, SVG) to Base64',
    'Decode Base64 data URIs back to viewable images',
    'Live image preview for both encode and decode',
    'Copy full data URI with one click',
    'Download decoded image from Base64 string',
    '100% client-side — files never leave your browser',
  ],
  faq: [
    { q: 'What is a Base64 image?', a: 'A Base64 image is a binary image file encoded as an ASCII text string. It can be embedded directly in HTML, CSS, or JSON without a separate file request.' },
    { q: 'Will Base64 increase the file size?', a: 'Yes. Base64 encoding increases the size of the data by approximately 33% compared to the original binary file.' },
    { q: 'Can I paste a partial Base64 string?', a: 'The preview requires a complete and valid data URI in the format data:image/[type];base64,[data]. Partial strings will not render.' },
  ],
};

const MODES = ['Encode', 'Decode'];

export default function Base64Image() {
  const [mode, setMode] = useState('Encode');
  const [encoded, setEncoded] = useState('');
  const [fileName, setFileName] = useState('');
  const [decodeInput, setDecodeInput] = useState('');
  const [decodeError, setDecodeError] = useState('');

  useSEO({
    title: 'Base64 Image Encoder',
    description: 'Encode images to Base64 data URIs or decode Base64 strings back to images. Free, instant, browser-based Base64 image tool.',
    keywords: ['base64 image encoder', 'image to base64', 'base64 to image', 'encode image base64', 'data uri generator'],
    jsonLd: [
      buildToolSchema({ name: 'Base64 Image Encoder', description: 'Encode images to Base64 data URIs and decode Base64 strings to images', url: '/tools/base64-image' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/base64-image',
  });

  const handleFileSelect = useCallback((file) => {
    setEncoded('');
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setEncoded(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDecodeInput = (val) => {
    setDecodeInput(val);
    setDecodeError('');
  };

  const isValidDataUri = (str) => /^data:image\/[a-zA-Z+]+;base64,/.test(str.trim());

  const decodePreviewSrc = decodeInput.trim() && isValidDataUri(decodeInput) ? decodeInput.trim() : null;

  const handleDownloadDecoded = () => {
    if (!decodePreviewSrc) return;
    const a = document.createElement('a');
    a.href = decodePreviewSrc;
    a.download = 'decoded-image';
    a.click();
  };

  return (
    <ToolLayout
      title="Base64 Image Encoder"
      description="Encode images to Base64 data URIs or decode Base64 strings back to viewable images."
      icon={<Base64ImageIcon className="w-6 h-6" />}
      category="Images"
      seoContent={seoContent}
    >
      {/* Mode tabs */}
      <div className="card py-3">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {MODES.map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setEncoded(''); setFileName(''); setDecodeInput(''); setDecodeError(''); }}
              className={`px-6 py-1.5 rounded-lg text-sm font-semibold transition-colors ${mode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {mode === 'Encode' ? (
        <div className="card space-y-4">
          <FileUpload
            accept="image/*"
            multiple={false}
            maxSize={5 * 1024 * 1024}
            onFileSelect={handleFileSelect}
            label="Click or drag an image here"
            helpText="JPEG, PNG, GIF, WEBP, SVG — max 5 MB"
          />

          {encoded && (
            <div className="space-y-3">
              {/* Preview */}
              <div className="flex justify-center">
                <img src={encoded} alt={fileName} className="max-h-48 rounded-xl border border-gray-200 object-contain" />
              </div>

              {/* Data URI output */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Base64 Data URI ({(encoded.length / 1024).toFixed(1)} KB)</span>
                  <ResultActions copyText={encoded} />
                </div>
                <textarea
                  readOnly
                  className="input font-mono text-xs resize-none bg-gray-50"
                  rows={4}
                  value={encoded}
                />
              </div>
            </div>
          )}

          {!encoded && (
            <p className="text-xs text-gray-400 text-center py-2">Upload an image to get its Base64 data URI.</p>
          )}
        </div>
      ) : (
        <div className="card space-y-4">
          <div>
            <label className="label">Base64 Data URI</label>
            <textarea
              className="input font-mono text-xs resize-none"
              rows={5}
              placeholder="data:image/png;base64,iVBORw0KGgoAAAA..."
              value={decodeInput}
              onChange={e => handleDecodeInput(e.target.value)}
              spellCheck={false}
            />
          </div>

          {decodeInput.trim() && !isValidDataUri(decodeInput) && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              Invalid format. Expected: <code className="font-mono">data:image/[type];base64,[data]</code>
            </div>
          )}

          {decodePreviewSrc && (
            <div className="space-y-3">
              <div className="flex justify-center">
                <img
                  src={decodePreviewSrc}
                  alt="Decoded"
                  onError={() => setDecodeError('Could not render image — the Base64 data may be corrupted.')}
                  className="max-h-64 rounded-xl border border-gray-200 object-contain"
                />
              </div>
              {decodeError && (
                <p className="text-xs text-red-500 text-center">{decodeError}</p>
              )}
              {!decodeError && (
                <div className="flex justify-center">
                  <button
                    onClick={handleDownloadDecoded}
                    className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Download Image
                  </button>
                </div>
              )}
            </div>
          )}

          {!decodeInput.trim() && (
            <p className="text-xs text-gray-400 text-center py-2">Paste a Base64 data URI above to preview the image.</p>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
