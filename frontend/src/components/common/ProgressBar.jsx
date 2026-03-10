import { motion } from 'framer-motion';

/**
 * ProgressBar — animated progress indicator for file processing.
 *
 * Usage:
 *   <ProgressBar value={65} />                        // 0–100, determinate
 *   <ProgressBar indeterminate label="Processing…" /> // indeterminate pulse
 *   <ProgressBar value={100} status="success" />      // green complete bar
 *   <ProgressBar value={40} status="error" />         // red error bar
 */
export default function ProgressBar({
  value = 0,
  indeterminate = false,
  label,
  status = 'default',   // 'default' | 'success' | 'error'
  className = '',
}) {
  const trackColors = {
    default: 'bg-gray-200',
    success: 'bg-green-100',
    error:   'bg-red-100',
  };
  const fillColors = {
    default: 'bg-[#2563EB]',
    success: 'bg-green-500',
    error:   'bg-red-500',
  };

  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 font-medium">{label}</span>
          {!indeterminate && (
            <span className={`font-semibold ${status === 'success' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-blue-600'}`}>
              {pct}%
            </span>
          )}
        </div>
      )}

      <div className={`h-2 rounded-full overflow-hidden ${trackColors[status]}`}>
        {indeterminate ? (
          /* sliding pulse for indeterminate state */
          <motion.div
            className={`h-full w-1/3 rounded-full ${fillColors.default}`}
            animate={{ x: ['0%', '300%'] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <motion.div
            className={`h-full rounded-full ${fillColors[status]}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        )}
      </div>

      {/* State message */}
      {status === 'success' && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-green-600 font-medium flex items-center gap-1"
        >
          <span>✓</span> Completed
        </motion.p>
      )}
      {status === 'error' && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 font-medium flex items-center gap-1"
        >
          <span>✗</span> Failed — please try again
        </motion.p>
      )}
    </div>
  );
}
