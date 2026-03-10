import { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  copyText,          // if set, clicking copies this text and shows "Copied ✓" feedback
  className = '',
  onClick,
  ...props
}) {
  const [copied, setCopied] = useState(false);

  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:   'bg-[#2563EB] text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost:     'text-gray-600 hover:bg-gray-100',
    outline:   'border border-gray-300 text-gray-700 hover:bg-gray-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const handleClick = async (e) => {
    if (copyText) {
      try {
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={disabled || loading ? {} : { scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" />}
      {copied ? <><span>✓</span> Copied!</> : children}
    </motion.button>
  );
}
