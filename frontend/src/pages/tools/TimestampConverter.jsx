import { useState, useEffect } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import Alert from '../../components/common/Alert';
import { TimestampConverterIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Timestamp Converter translates between Unix timestamps (seconds or milliseconds since 1 January 1970 UTC) and human-readable dates. It displays a live current timestamp, converts in both directions, and shows output in your local timezone as well as ISO 8601 and UTC formats.',
  howTo: [
    'View the live current Unix timestamp (seconds) at the top — it updates every second.',
    'To convert a timestamp to a date: paste the number into the first section and click "Convert to Date".',
    'To convert a date to a timestamp: pick the date and time using the date picker and click "Get Timestamp".',
    'Toggle between seconds and milliseconds to match your use case.',
  ],
  features: [
    'Live current Unix timestamp — updates every second',
    'Timestamp → Date (local, ISO 8601, and UTC formats)',
    'Date → Unix timestamp (seconds and milliseconds)',
    'Supports both seconds (10-digit) and milliseconds (13-digit) input',
    'Shows day of week, week number, and days since epoch',
    'Runs entirely in your browser',
  ],
  faq: [
    { q: 'What is a Unix timestamp?', a: 'A Unix timestamp is the number of seconds elapsed since 00:00:00 UTC on 1 January 1970 (the "Unix epoch"). It provides a single integer that represents any point in time, independent of timezone or calendar conventions.' },
    { q: 'How do I know if my timestamp is in seconds or milliseconds?', a: 'Timestamps in seconds are typically 10 digits long (e.g. 1700000000). Millisecond timestamps are 13 digits (e.g. 1700000000000). JavaScript\'s Date.now() returns milliseconds; most Unix/Linux commands use seconds.' },
    { q: 'What is ISO 8601?', a: 'ISO 8601 is the international standard for date and time representation. It uses the format YYYY-MM-DDTHH:mm:ss.sssZ, where T separates date and time, and Z indicates UTC. It is unambiguous and sortable alphabetically.' },
    { q: 'How do timezones affect the conversion?', a: 'Unix timestamps are always in UTC. The "local" display converts to your system\'s configured timezone. The ISO and UTC outputs always show the value in UTC regardless of your location.' },
  ],
};

function formatTs(ts, unit) {
  const ms = unit === 'ms' ? ts : ts * 1000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return null;
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const weekNum = Math.ceil((((d - new Date(d.getFullYear(),0,1)) / 86400000) + new Date(d.getFullYear(),0,1).getDay() + 1) / 7);
  return {
    local: d.toLocaleString(),
    iso: d.toISOString(),
    utc: d.toUTCString(),
    dayOfWeek: dayNames[d.getDay()],
    weekNumber: weekNum,
  };
}

export default function TimestampConverter() {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [tsInput, setTsInput] = useState('');
  const [tsUnit, setTsUnit] = useState('s');
  const [tsResult, setTsResult] = useState(null);
  const [tsError, setTsError] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [dateResult, setDateResult] = useState(null);
  const [copiedNow, setCopiedNow] = useState(false);

  useSEO({
    title: 'Timestamp Converter',
    description: 'Convert Unix timestamps to human-readable dates and dates to Unix timestamps. Live current timestamp display. Free online epoch converter.',
    keywords: ['timestamp converter', 'unix timestamp', 'epoch converter', 'unix time', 'date to timestamp', 'epoch to date'],
    jsonLd: [
      buildToolSchema({ name: 'Timestamp Converter', description: 'Convert Unix timestamps to dates and vice versa', url: '/tools/timestamp-converter' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/timestamp-converter',
  });

  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const copyNow = async () => {
    await navigator.clipboard.writeText(String(now));
    setCopiedNow(true);
    setTimeout(() => setCopiedNow(false), 1500);
  };

  const convertTsToDate = () => {
    setTsError('');
    setTsResult(null);
    const num = parseFloat(tsInput);
    if (isNaN(num)) { setTsError('Please enter a valid number.'); return; }
    const result = formatTs(num, tsUnit);
    if (!result) { setTsError('Invalid timestamp — the resulting date is out of range.'); return; }
    setTsResult(result);
  };

  const convertDateToTs = () => {
    if (!dateInput) return;
    const ms = new Date(dateInput).getTime();
    if (isNaN(ms)) return;
    setDateResult({ seconds: Math.floor(ms / 1000), milliseconds: ms });
  };

  return (
    <ToolLayout
      title="Timestamp Converter"
      description="Convert Unix timestamps to dates and dates to timestamps. Live epoch clock."
      icon={<TimestampConverterIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      {/* Live current timestamp */}
      <div className="card text-center py-6 bg-gradient-to-b from-purple-50 to-white">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-semibold">Current Unix Timestamp</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-4xl font-mono font-bold text-purple-700">{now}</span>
          <button
            onClick={copyNow}
            className="text-xs font-semibold text-purple-500 hover:text-purple-700 px-2.5 py-1 border border-purple-200 rounded-lg transition-colors"
          >
            {copiedNow ? '✓' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">{new Date().toLocaleString()}</p>
      </div>

      {/* Timestamp → Date */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-900">Timestamp → Date</h3>
        <div className="flex gap-3 flex-wrap">
          <input
            type="number"
            className="input flex-1 min-w-0 font-mono"
            placeholder="Paste Unix timestamp…"
            value={tsInput}
            onChange={e => setTsInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && convertTsToDate()}
          />
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {['s', 'ms'].map(u => (
              <button
                key={u}
                onClick={() => setTsUnit(u)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  tsUnit === u ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-purple-50'
                }`}
              >
                {u === 's' ? 'Seconds' : 'Millisec'}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={convertTsToDate}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
        >
          Convert to Date
        </button>
        {tsError && <Alert type="error" message={tsError} />}
        {tsResult && (
          <div className="space-y-2 text-sm bg-gray-50 rounded-xl p-4">
            {[
              ['Local', tsResult.local],
              ['ISO 8601', tsResult.iso],
              ['UTC', tsResult.utc],
              ['Day', tsResult.dayOfWeek],
              ['Week #', tsResult.weekNumber],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-3">
                <span className="text-gray-400 w-16 shrink-0 font-medium">{k}</span>
                <code className="text-gray-800 font-mono break-all">{v}</code>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Date → Timestamp */}
      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-900">Date & Time → Timestamp</h3>
        <input
          type="datetime-local"
          className="input"
          value={dateInput}
          onChange={e => setDateInput(e.target.value)}
        />
        <button
          onClick={convertDateToTs}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
        >
          Get Timestamp
        </button>
        {dateResult && (
          <div className="space-y-2 text-sm bg-gray-50 rounded-xl p-4">
            <div className="flex gap-3">
              <span className="text-gray-400 w-24 shrink-0 font-medium">Seconds</span>
              <code className="text-purple-700 font-mono font-bold">{dateResult.seconds}</code>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-400 w-24 shrink-0 font-medium">Milliseconds</span>
              <code className="text-purple-700 font-mono font-bold">{dateResult.milliseconds}</code>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
