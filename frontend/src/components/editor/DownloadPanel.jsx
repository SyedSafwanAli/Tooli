import { useState } from 'react';

export default function DownloadPanel({ getBlob, originalName, disabled, extraActions }) {
  const [dlFormat, setDlFormat] = useState('png');
  const [copying, setCopying]   = useState(false);
  const [sharing, setSharing]   = useState(false);

  const stem = originalName ? originalName.replace(/\.[^.]+$/, '') : 'image';

  async function handleDownload() {
    const blob = await getBlob(dlFormat === 'jpg' ? 'jpeg' : dlFormat, 0.92);
    if (!blob) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${stem}-tooli.${dlFormat}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function handleCopy() {
    try {
      const blob = await getBlob('png', 1);
      if (!blob) return;
      setCopying(true);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setTimeout(() => setCopying(false), 1500);
    } catch { setCopying(false); }
  }

  async function handleShare() {
    try {
      const blob = await getBlob('png', 1);
      if (!blob) return;
      const file = new File([blob], `${stem}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        setSharing(true);
        await navigator.share({ files: [file], title: 'Image from Tooli' });
        setSharing(false);
      }
    } catch { setSharing(false); }
  }

  return (
    <div className="space-y-3">
      {/* Format selector + download */}
      <div className="flex gap-2">
        <select
          value={dlFormat}
          onChange={e => setDlFormat(e.target.value)}
          disabled={disabled}
          className="input text-sm flex-1"
        >
          <option value="png">PNG</option>
          <option value="jpg">JPEG</option>
          <option value="webp">WebP</option>
        </select>
        <button
          onClick={handleDownload}
          disabled={disabled}
          className="btn btn-primary text-sm px-4 disabled:opacity-40"
        >
          Download
        </button>
      </div>

      {/* Copy + Share */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          disabled={disabled}
          className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          {copying ? (
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
          {copying ? 'Copied!' : 'Copy PNG'}
        </button>
        {typeof navigator !== 'undefined' && navigator.share && (
          <button
            onClick={handleShare}
            disabled={disabled || sharing}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>
        )}
      </div>

      {/* Extra slot for tool-specific actions */}
      {extraActions}
    </div>
  );
}
