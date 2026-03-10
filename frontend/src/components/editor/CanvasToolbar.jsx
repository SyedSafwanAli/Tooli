export default function CanvasToolbar({ onAction, disabled }) {
  const btn = (action, title, svg) => (
    <button
      onClick={() => onAction(action)}
      disabled={disabled}
      title={title}
      className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-gray-700"
    >
      {svg}
    </button>
  );

  return (
    <div className="flex items-center flex-wrap gap-1 p-2 bg-white border border-gray-200 rounded-xl">
      {btn('rotateLeft', 'Rotate Left',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      )}
      {btn('rotateRight', 'Rotate Right',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
        </svg>
      )}
      <div className="w-px h-6 bg-gray-200 mx-1" />
      {btn('flipH', 'Flip Horizontal',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 8V4m0 12l4-4m-4 4l-4-4" />
        </svg>
      )}
      {btn('flipV', 'Flip Vertical',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 17h16M8 3l-4 4 4 4M16 21l4-4-4-4" />
        </svg>
      )}
      <div className="w-px h-6 bg-gray-200 mx-1" />
      {btn('zoomIn', 'Zoom In',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35M11 8v6m-3-3h6" />
        </svg>
      )}
      {btn('zoomOut', 'Zoom Out',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35M8 11h6" />
        </svg>
      )}
      {btn('resetView', 'Reset View',
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )}
      <div className="w-px h-6 bg-gray-200 mx-1" />
      {btn('resetAll', 'Reset All',
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      )}
    </div>
  );
}
