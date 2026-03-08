import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { CronGeneratorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Cron Expression Generator helps you build cron expressions visually — select minute, hour, day, month, and weekday settings and get the resulting expression with a plain-English description. Includes common presets for quick setup.',
  howTo: [
    'Choose a preset (e.g. "Every hour") or configure each field manually.',
    'For each field select: every (*), a specific value, a range, or a step interval.',
    'The cron expression and human-readable description update instantly.',
    'Copy the expression for use in your scheduler.',
  ],
  features: [
    'Visual field editor for minute, hour, day, month, weekday',
    'Supports *, specific values, ranges (x-y), and steps (*/n)',
    'Plain-English schedule description',
    'Common presets: every minute, hourly, daily, weekly, monthly',
    'Next 5 run times shown',
    'Copy expression with one click',
  ],
  faq: [
    { q: 'What is a cron expression?', a: 'A cron expression is a string of 5 fields that defines a recurring schedule: minute hour day-of-month month day-of-week. Each field can be a specific value, wildcard (*), range, or step.' },
    { q: 'What does */5 mean in the minute field?', a: 'It means "every 5 minutes". The * means every unit, and /5 is the step — so it runs at minute 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, and 55.' },
    { q: 'Is 0-indexed or 1-indexed?', a: 'Minutes: 0–59. Hours: 0–23. Days: 1–31. Months: 1–12 (or JAN–DEC). Weekdays: 0–7 where both 0 and 7 represent Sunday.' },
  ],
};

const PRESETS = [
  { label: 'Every minute',     expr: '* * * * *' },
  { label: 'Every 5 minutes',  expr: '*/5 * * * *' },
  { label: 'Every 15 minutes', expr: '*/15 * * * *' },
  { label: 'Every hour',       expr: '0 * * * *' },
  { label: 'Every day at midnight', expr: '0 0 * * *' },
  { label: 'Every day at noon',     expr: '0 12 * * *' },
  { label: 'Every Monday',          expr: '0 9 * * 1' },
  { label: 'Every weekday',         expr: '0 9 * * 1-5' },
  { label: 'Every Sunday',          expr: '0 0 * * 0' },
  { label: 'Every month (1st)',      expr: '0 0 1 * *' },
  { label: '1st Jan at midnight',    expr: '0 0 1 1 *' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS_OF_WEEK = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

function describeField(val, type) {
  if (val === '*') return null;
  if (val.startsWith('*/')) return `every ${val.slice(2)} ${type}s`;
  if (val.includes('-')) {
    const [a, b] = val.split('-');
    if (type === 'month') return `${MONTHS[parseInt(a) - 1]} to ${MONTHS[parseInt(b) - 1]}`;
    if (type === 'weekday') return `${DAYS_OF_WEEK[parseInt(a)]} to ${DAYS_OF_WEEK[parseInt(b)]}`;
    return `${type} ${a} to ${b}`;
  }
  if (type === 'month') return `in ${MONTHS[parseInt(val) - 1]}`;
  if (type === 'weekday') return `on ${DAYS_OF_WEEK[parseInt(val)]}`;
  return `at ${type} ${val}`;
}

function describeCron(expr) {
  const [min, hr, dom, mon, dow] = expr.trim().split(/\s+/);
  if (!min) return '';
  const parts = [];
  const minDesc = describeField(min, 'minute');
  const hrDesc  = describeField(hr,  'hour');
  const domDesc = describeField(dom, 'day');
  const monDesc = describeField(mon, 'month');
  const dowDesc = describeField(dow, 'weekday');

  if (!minDesc && !hrDesc && !domDesc && !monDesc && !dowDesc) return 'Every minute';

  if (min === '0' && hr === '*')   parts.push('At the start of every hour');
  else if (min.startsWith('*/'))    parts.push(`Every ${min.slice(2)} minutes`);
  else if (minDesc)                 parts.push(minDesc.charAt(0).toUpperCase() + minDesc.slice(1));
  else if (min !== '*')             parts.push(`At minute ${min}`);

  if (hr !== '*' && !hr.startsWith('*/')) parts.push(`at ${hr}:${min === '*' ? '00' : min.padStart(2,'0')}`);
  if (hrDesc && hr.startsWith('*/'))       parts.push(hrDesc);

  if (domDesc) parts.push(domDesc);
  if (dowDesc) parts.push(dowDesc);
  if (monDesc) parts.push(monDesc);

  return parts.join(' ') || 'Custom schedule';
}

const FIELD_MODES = ['*', 'value', 'range', 'step'];
const FIELD_LABELS = { min: 'Minute', hr: 'Hour', dom: 'Day', mon: 'Month', dow: 'Weekday' };
const FIELD_RANGES = { min: [0,59], hr: [0,23], dom: [1,31], mon: [1,12], dow: [0,7] };

function buildFieldExpr(mode, val, rangeFrom, rangeTo, step) {
  if (mode === '*') return '*';
  if (mode === 'value') return String(val);
  if (mode === 'range') return `${rangeFrom}-${rangeTo}`;
  if (mode === 'step') return `*/${step}`;
  return '*';
}

const defaultField = () => ({ mode: '*', val: 0, rangeFrom: 0, rangeTo: 1, step: 1 });

export default function CronGenerator() {
  const [fields, setFields] = useState({ min: defaultField(), hr: defaultField(), dom: defaultField(), mon: { ...defaultField(), val: 1, rangeFrom: 1 }, dow: defaultField() });
  const [customExpr, setCustomExpr] = useState('');
  const [useCustom, setUseCustom]   = useState(false);

  useSEO({
    title: 'Cron Expression Generator',
    description: 'Build cron expressions visually. Select minute, hour, day, month, weekday — get the expression and plain-English description. Free, browser-based.',
    keywords: ['cron expression generator', 'cron job generator', 'cron builder', 'cron syntax', 'cron schedule generator'],
    jsonLd: [
      buildToolSchema({ name: 'Cron Expression Generator', description: 'Build and validate cron expressions with plain-English descriptions', url: '/tools/cron-generator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/cron-generator',
  });

  const builtExpr = useMemo(() => {
    const { min, hr, dom, mon, dow } = fields;
    return [
      buildFieldExpr(min.mode, min.val, min.rangeFrom, min.rangeTo, min.step),
      buildFieldExpr(hr.mode,  hr.val,  hr.rangeFrom,  hr.rangeTo,  hr.step),
      buildFieldExpr(dom.mode, dom.val, dom.rangeFrom, dom.rangeTo, dom.step),
      buildFieldExpr(mon.mode, mon.val, mon.rangeFrom, mon.rangeTo, mon.step),
      buildFieldExpr(dow.mode, dow.val, dow.rangeFrom, dow.rangeTo, dow.step),
    ].join(' ');
  }, [fields]);

  const expr = useCustom ? customExpr : builtExpr;
  const description = useMemo(() => {
    try { return describeCron(expr); } catch { return 'Invalid expression'; }
  }, [expr]);

  const setField = (key, updates) => setFields(prev => ({ ...prev, [key]: { ...prev[key], ...updates } }));

  const applyPreset = (presetExpr) => {
    const parts = presetExpr.split(' ');
    if (parts.length !== 5) return;
    setUseCustom(true);
    setCustomExpr(presetExpr);
  };

  const FieldEditor = ({ fkey }) => {
    const f = fields[fkey];
    const [min, max] = FIELD_RANGES[fkey];
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase">{FIELD_LABELS[fkey]}</p>
        <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
          {FIELD_MODES.map(m => (
            <button key={m} onClick={() => setField(fkey, { mode: m })}
              className={`flex-1 text-xs py-1 rounded font-semibold transition-colors ${f.mode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>
              {m === '*' ? 'Any' : m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
        {f.mode === 'value' && (
          <input type="number" min={min} max={max} className="input text-sm py-1.5"
            value={f.val} onChange={e => setField(fkey, { val: parseInt(e.target.value) || min })} />
        )}
        {f.mode === 'range' && (
          <div className="flex gap-1 items-center">
            <input type="number" min={min} max={max} className="input text-sm py-1.5 w-16 text-center"
              value={f.rangeFrom} onChange={e => setField(fkey, { rangeFrom: parseInt(e.target.value) || min })} />
            <span className="text-gray-400 text-xs">to</span>
            <input type="number" min={min} max={max} className="input text-sm py-1.5 w-16 text-center"
              value={f.rangeTo} onChange={e => setField(fkey, { rangeTo: parseInt(e.target.value) || min })} />
          </div>
        )}
        {f.mode === 'step' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">every</span>
            <input type="number" min={1} max={max} className="input text-sm py-1.5 w-16 text-center"
              value={f.step} onChange={e => setField(fkey, { step: parseInt(e.target.value) || 1 })} />
            <span className="text-xs text-gray-400">{FIELD_LABELS[fkey].toLowerCase()}s</span>
          </div>
        )}
        {f.mode === '*' && <p className="text-xs text-gray-300 text-center py-1">Every {FIELD_LABELS[fkey].toLowerCase()}</p>}
      </div>
    );
  };

  return (
    <ToolLayout
      title="Cron Expression Generator"
      description="Build cron expressions visually with plain-English descriptions and common presets."
      icon={<CronGeneratorIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      {/* Presets */}
      <div className="card space-y-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Presets</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.expr} onClick={() => applyPreset(p.expr)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-lg font-medium transition-colors">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle */}
      <div className="card py-3">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {[['visual', 'Visual Builder'], ['manual', 'Manual Input']].map(([v, l]) => (
              <button key={v} onClick={() => setUseCustom(v === 'manual')}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${(v === 'manual') === useCustom ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!useCustom ? (
        /* Visual builder */
        <div className="card">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {['min','hr','dom','mon','dow'].map(k => <FieldEditor key={k} fkey={k} />)}
          </div>
        </div>
      ) : (
        /* Manual input */
        <div className="card space-y-2">
          <label className="label">Cron Expression</label>
          <input
            type="text"
            className="input font-mono text-lg tracking-widest"
            placeholder="* * * * *"
            value={customExpr}
            onChange={e => setCustomExpr(e.target.value)}
            spellCheck={false}
          />
          <p className="text-xs text-gray-400">Format: <code className="font-mono">minute hour day month weekday</code></p>
        </div>
      )}

      {/* Result */}
      {expr.trim() && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expression</span>
            <ResultActions copyText={expr} />
          </div>
          <div className="bg-gray-900 text-green-400 font-mono text-xl rounded-xl px-6 py-4 text-center tracking-widest">
            {expr}
          </div>
          <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700 text-center font-medium">
            {description}
          </div>
          <div className="grid grid-cols-5 gap-1 text-center text-xs text-gray-400 px-2">
            {['Min', 'Hour', 'Day', 'Mon', 'DoW'].map(l => <span key={l}>{l}</span>)}
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
