import { useState } from 'react';
import { formatBytes } from '../../utils/formatters';

const TABS = ['Side by Side', 'Original', 'Result'];

export default function ImagePreview({ originalFile, resultBlob, originalSize, resultSize, savedPct }) {
  const [tab, setTab] = useState(0);
  const [origUrl] = useState(() => originalFile ? URL.createObjectURL(originalFile) : null);
  const [resUrl]  = useState(() => resultBlob   ? URL.createObjectURL(resultBlob)   : null);

  if (!origUrl && !resUrl) return null;

  return (
    <div className="card space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${tab === i ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Stats row */}
      {resultBlob && (
        <div className="flex gap-4 text-xs text-gray-500">
          <span>Original: <b className="text-gray-800">{formatBytes(originalSize)}</b></span>
          <span>Result: <b className="text-gray-800">{formatBytes(resultSize)}</b></span>
          {savedPct > 0 && <span className="text-green-600 font-semibold">−{savedPct}% saved</span>}
        </div>
      )}

      {/* Images */}
      {tab === 0 && (
        <div className="grid grid-cols-2 gap-3">
          {origUrl && (
            <div>
              <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Original</p>
              <img src={origUrl} alt="Original" className="w-full rounded-lg object-contain max-h-64 bg-gray-50 border border-gray-100" />
            </div>
          )}
          {resUrl && (
            <div>
              <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wide">Result</p>
              <img src={resUrl} alt="Result" className="w-full rounded-lg object-contain max-h-64 bg-gray-50 border border-gray-100" />
            </div>
          )}
        </div>
      )}
      {tab === 1 && origUrl && (
        <img src={origUrl} alt="Original" className="w-full rounded-lg object-contain max-h-96 bg-gray-50 border border-gray-100" />
      )}
      {tab === 2 && resUrl && (
        <img src={resUrl} alt="Result" className="w-full rounded-lg object-contain max-h-96 bg-gray-50 border border-gray-100" />
      )}
    </div>
  );
}
