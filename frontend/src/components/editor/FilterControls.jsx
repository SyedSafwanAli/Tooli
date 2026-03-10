const FILTERS = [
  { key: 'brightness', label: 'Brightness', min: -1, max: 1, step: 0.05, default: 0 },
  { key: 'contrast',   label: 'Contrast',   min: -1, max: 1, step: 0.05, default: 0 },
  { key: 'saturation', label: 'Saturation', min: -1, max: 1, step: 0.05, default: 0 },
  { key: 'blur',       label: 'Blur',       min: 0,  max: 20, step: 0.5,  default: 0 },
];

export default function FilterControls({ filters, onChange, disabled }) {
  const pct = (v, min, max) => Math.round(((v - min) / (max - min)) * 100);

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Filters</p>
      {FILTERS.map(f => (
        <div key={f.key}>
          <div className="flex justify-between mb-1">
            <label className="text-xs text-gray-700">{f.label}</label>
            <span className="text-xs text-blue-600 font-medium tabular-nums">
              {filters[f.key] !== undefined ? filters[f.key].toFixed(2) : f.default.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min={f.min}
            max={f.max}
            step={f.step}
            value={filters[f.key] ?? f.default}
            onChange={e => onChange(f.key, parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full accent-blue-600 disabled:opacity-40"
          />
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>{f.min}</span>
            <span>{f.max}</span>
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between pt-1">
        <label className="text-xs text-gray-700">Grayscale</label>
        <div
          onClick={() => !disabled && onChange('grayscale', !filters.grayscale)}
          className={`relative w-8 rounded-full transition-colors cursor-pointer ${filters.grayscale ? 'bg-blue-600' : 'bg-gray-200'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
          style={{ height: '1.1rem' }}
        >
          <span
            className={`absolute top-0.5 left-0.5 bg-white rounded-full shadow transition-transform ${filters.grayscale ? 'translate-x-3.5' : ''}`}
            style={{ width: '0.85rem', height: '0.85rem' }}
          />
        </div>
      </div>

      <button
        onClick={() => onChange('reset', null)}
        disabled={disabled}
        className="w-full text-xs text-gray-500 hover:text-red-500 disabled:opacity-40 transition-colors py-1"
      >
        Reset filters
      </button>
    </div>
  );
}
