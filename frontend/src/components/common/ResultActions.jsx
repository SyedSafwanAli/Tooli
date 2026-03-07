/**
 * Universal result action bar: Download, Copy, Share.
 *
 * Props:
 *   onDownload   — () => void  — called when Download is clicked (required)
 *   copyText     — string      — text to copy (optional; shows Copy button when provided)
 *   shareData    — { title, text, url }  — for Web Share API (optional)
 *   downloadLabel — string     — override the download button label
 */
import { useState } from 'react';

export default function ResultActions({ onDownload, copyText, shareData, downloadLabel = 'Download' }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const canShare = typeof navigator.share === 'function' && shareData;

  const handleCopy = async () => {
    if (!copyText) return;
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await navigator.share(shareData);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      // User cancelled or share failed — silently ignore
    }
  };

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {/* Download */}
      <button
        onClick={onDownload}
        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <DownloadIcon />
        {downloadLabel}
      </button>

      {/* Copy */}
      {copyText !== undefined && (
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      )}

      {/* Share */}
      {canShare && (
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
        >
          <ShareIcon />
          {shared ? 'Shared!' : 'Share'}
        </button>
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}
