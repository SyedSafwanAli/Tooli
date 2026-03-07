import { useRef, useState } from 'react';
import { UploadIcon } from './Icons';
import { formatBytes } from '../../utils/formatters';

export default function FileUpload({
  accept,
  multiple = false,
  maxSize,
  onFileSelect,
  label = 'Click or drag file here',
  helpText,
  disabled,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);

  const validate = (files) => {
    setError('');
    const arr = Array.from(files);
    if (maxSize) {
      const oversized = arr.filter(f => f.size > maxSize);
      if (oversized.length) {
        setError(`File too large. Max: ${formatBytes(maxSize)}`);
        return false;
      }
    }
    return true;
  };

  const handleFiles = (files) => {
    if (!validate(files)) return;
    const arr = Array.from(files);
    setSelectedFiles(arr);
    onFileSelect(multiple ? arr : arr[0]);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (idx) => {
    const next = selectedFiles.filter((_, i) => i !== idx);
    setSelectedFiles(next);
    onFileSelect(multiple ? next : null);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label={label}
        className={[
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 select-none',
          dragOver
            ? 'border-blue-500 bg-blue-50 scale-[1.01] shadow-lg shadow-blue-100'
            : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50',
          disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled}
        />

        {/* Upload icon */}
        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 transition-colors ${dragOver ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
          <UploadIcon className="w-7 h-7" />
        </div>

        <p className="font-semibold text-gray-700 text-sm">
          {dragOver ? 'Drop files here!' : label}
        </p>
        {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}

        {/* Fake button */}
        {!dragOver && (
          <span className="inline-block mt-3 px-4 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Browse Files
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 font-medium flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Selected file list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((f, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm"
            >
              <span className="text-green-500 text-base">✓</span>
              <span className="flex-1 text-gray-800 font-medium truncate">{f.name}</span>
              <span className="text-gray-400 text-xs shrink-0">{formatBytes(f.size)}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="text-gray-400 hover:text-red-500 transition-colors text-base leading-none ml-1"
                aria-label="Remove file"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
