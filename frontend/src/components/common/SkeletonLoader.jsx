/**
 * SkeletonLoader — animated placeholder for loading states.
 *
 * Usage:
 *   <SkeletonLoader />                         // single line, full-width
 *   <SkeletonLoader width="w-1/2" height="h-4" />
 *   <SkeletonLoader variant="card" />          // full tool-card skeleton
 *   <SkeletonLoader variant="text" lines={4} /> // paragraph of lines
 */
export default function SkeletonLoader({
  variant = 'line',
  width = 'w-full',
  height = 'h-4',
  lines = 3,
  className = '',
}) {
  const pulse = 'animate-pulse bg-gray-200 rounded';

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm ${className}`}>
        <div className="flex items-start gap-4">
          <div className={`${pulse} w-11 h-11 rounded-xl flex-shrink-0`} />
          <div className="flex-1 space-y-2 pt-1">
            <div className={`${pulse} h-4 w-3/4`} />
            <div className={`${pulse} h-3 w-full`} />
            <div className={`${pulse} h-3 w-2/3`} />
          </div>
        </div>
        <div className="mt-4 flex justify-between">
          <div className={`${pulse} h-3 w-24`} />
          <div className={`${pulse} h-3 w-16`} />
        </div>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${pulse} h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
          />
        ))}
      </div>
    );
  }

  // default: single line
  return <div className={`${pulse} ${height} ${width} ${className}`} />;
}

/** Convenience: grid of card skeletons for the tool grid */
export function ToolGridSkeleton({ count = 6 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} variant="card" />
      ))}
    </div>
  );
}
