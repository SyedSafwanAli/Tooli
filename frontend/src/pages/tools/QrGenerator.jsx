import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import ToolLayout from '../../components/common/ToolLayout';
import Button from '../../components/common/Button';
import { QrGeneratorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli QR Code Generator creates QR codes for any text, URL, phone number, email address, or contact card. You can customise the size, foreground colour, background colour, and error correction level. Download the result as a PNG image.',
  howTo: [
    'Type or paste your URL or text into the Content field.',
    'Adjust the size slider to set the output resolution.',
    'Optionally change the foreground and background colours.',
    'Select an error correction level — higher levels allow the QR code to be scanned even if partially obscured.',
    'Click "Download PNG" to save the QR code.',
  ],
  features: [
    'Generates QR codes for URLs, text, email, phone, and more',
    'Customisable foreground and background colours',
    'Adjustable output size (100px to 600px)',
    'Four error correction levels (L, M, Q, H)',
    'Instant preview updates as you type',
    'Download as PNG image',
  ],
  faq: [
    { q: 'What content can I encode in a QR code?', a: 'You can encode any text: URLs, plain text, phone numbers (tel:+44...), email addresses (mailto:...), WiFi credentials, or vCard contact data.' },
    { q: 'What does error correction level mean?', a: 'Error correction allows a QR code to be scanned even if part of it is damaged or obscured. Level L handles 7% damage, M handles 15%, Q handles 25%, and H handles 30%. Higher levels make the code larger.' },
    { q: 'Is there a character limit?', a: 'QR codes can store up to about 3,000 alphanumeric characters. Longer content produces denser, harder-to-scan codes. For URLs, shorter links produce better results.' },
  ],
};

export default function QrGenerator() {
  const [input, setInput] = useState('https://tooli.app');
  const [size, setSize] = useState(300);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState('M');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState('');

  useSEO({
    title: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, and more. Download as PNG. Free and instant.',
    keywords: ['qr code generator', 'qr code', 'create qr code', 'qrcode online', 'free qr generator'],
    jsonLd: [buildToolSchema({ name: 'QR Code Generator', description: 'Generate QR codes for URLs and text online for free', url: '/tools/qr-generator' }), buildFAQSchema(seoContent.faq)],
    canonical: '/tools/qr-generator',
  });

  useEffect(() => {
    if (!input.trim()) { setQrDataUrl(''); return; }
    setError('');
    QRCode.toDataURL(input, {
      width: size,
      margin: 2,
      color: { dark: fgColor, light: bgColor },
      errorCorrectionLevel: errorLevel,
    })
      .then(url => setQrDataUrl(url))
      .catch(e => setError(e.message));
  }, [input, size, fgColor, bgColor, errorLevel]);

  const download = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'qrcode.png';
    a.click();
  };

  return (
    <ToolLayout
      title="QR Code Generator"
      description="Generate QR codes for URLs, text, contact info and more. Download as PNG."
      icon={<QrGeneratorIcon className="w-6 h-6" />}
      category="Utility"
      seoContent={seoContent}
    >
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card space-y-4">
          <div>
            <label className="label">Content</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={3}
              className="input resize-none text-sm"
              placeholder="URL, text, phone number..."
            />
          </div>

          <div>
            <label className="label">Size: <span className="text-blue-600 font-bold">{size}px</span></label>
            <input type="range" min={100} max={600} step={50} value={size}
              onChange={e => setSize(+e.target.value)} className="w-full accent-blue-600" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">QR Color</label>
              <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
            </div>
            <div>
              <label className="label">Background</label>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
            </div>
          </div>

          <div>
            <label className="label">Error Correction</label>
            <select value={errorLevel} onChange={e => setErrorLevel(e.target.value)} className="input text-sm">
              <option value="L">L — Low (7%)</option>
              <option value="M">M — Medium (15%)</option>
              <option value="Q">Q — Quartile (25%)</option>
              <option value="H">H — High (30%)</option>
            </select>
          </div>
        </div>

        {/* Preview */}
        <div className="card flex flex-col items-center justify-center gap-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {qrDataUrl ? (
            <>
              <img src={qrDataUrl} alt="QR Code" className="rounded-lg shadow" style={{ maxWidth: '100%' }} />
              <Button onClick={download} className="w-full">⬇ Download PNG</Button>
            </>
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-5xl mb-2">⬛</div>
              <p className="text-sm">QR code will appear here</p>
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
