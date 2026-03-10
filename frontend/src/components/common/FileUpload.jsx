import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <motion.div
        animate={dragOver
          ? { scale: 1.015 }
          : { scale: 1 }
        }
        transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label={label}
        className={[
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer select-none transition-colors duration-200',
          dragOver
            ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
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
        <motion.div
          animate={dragOver ? { scale: 1.15, rotate: -6 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className={`inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 ${dragOver ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
        >
          <UploadIcon className="w-7 h-7" />
        </motion.div>

        <p className="font-semibold text-gray-700 text-sm">
          {dragOver ? 'Drop files here!' : label}
        </p>
        {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}

        {!dragOver && (
          <span className="inline-block mt-3 px-4 py-1.5 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Browse Files
          </span>
        )}
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-sm text-red-600 font-medium flex items-center gap-1"
          >
            <span>⚠</span> {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Selected file list */}
      <AnimatePresence initial={false}>
        {selectedFiles.map((f, i) => (
          <motion.div
            key={f.name + i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm overflow-hidden"
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
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
