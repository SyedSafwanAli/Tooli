import { useState, useEffect, useRef } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { CountdownTimerIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Countdown Timer lets you set a precise countdown to any future date and time. It displays days, hours, minutes, and seconds remaining and updates every second in real time. No account needed — it runs entirely in your browser.',
  howTo: [
    'Enter the target date and time in the date/time fields.',
    'Or click a Quick preset (e.g. +1 Hour, +24 Hours) to set a countdown instantly.',
    'The timer starts automatically and counts down every second.',
    'When the countdown reaches zero an alert is shown.',
  ],
  features: [
    'Live countdown in days, hours, minutes, seconds',
    'Custom target date and time input',
    'Quick presets: +1 min, +5 min, +15 min, +1 hr, +24 hr, +1 week',
    'Visual progress bar showing percentage of time elapsed',
    'Alert when countdown reaches zero',
    'Runs entirely in-browser — no server required',
  ],
  faq: [
    { q: 'Does the countdown keep running if I switch tabs?', a: 'Yes. The timer uses the system clock (Date.now()) each tick, not an accumulated counter, so it stays accurate even when the tab is in the background.' },
    { q: 'Can I count down to a specific date across days?', a: 'Yes. Enter any future date and time in the date picker. The timer will show days, hours, minutes, and seconds remaining.' },
    { q: 'What happens when the timer reaches zero?', a: 'The display shows all zeros, the progress bar fills, and a browser alert notification fires.' },
  ],
};

const PRESETS = [
  { label: '+1 min',  seconds: 60 },
  { label: '+5 min',  seconds: 300 },
  { label: '+15 min', seconds: 900 },
  { label: '+1 hr',   seconds: 3600 },
  { label: '+24 hr',  seconds: 86400 },
  { label: '+1 week', seconds: 604800 },
];

function toLocalDatetimeString(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function decompose(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  return {
    days:    Math.floor(s / 86400),
    hours:   Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export default function CountdownTimer() {
  const defaultTarget = new Date(Date.now() + 3600_000); // +1 hour
  const [targetStr, setTargetStr] = useState(toLocalDatetimeString(defaultTarget));
  const [remaining, setRemaining] = useState(null);
  const [startTs, setStartTs] = useState(null);
  const [totalDuration, setTotalDuration] = useState(null);
  const [finished, setFinished] = useState(false);
  const alertedRef = useRef(false);

  useSEO({
    title: 'Countdown Timer',
    description: 'Free online countdown timer. Set any future date and time and watch the live days/hours/minutes/seconds display count down.',
    keywords: ['countdown timer', 'online countdown', 'timer countdown', 'date countdown', 'event countdown'],
    jsonLd: [
      buildToolSchema({ name: 'Countdown Timer', description: 'Live countdown to any target date and time', url: '/tools/countdown-timer' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/countdown-timer',
  });

  // Compute remaining on each tick
  useEffect(() => {
    const tick = () => {
      const target = new Date(targetStr).getTime();
      if (isNaN(target)) { setRemaining(null); return; }
      const now = Date.now();
      const diff = Math.round((target - now) / 1000);
      if (diff <= 0) {
        setRemaining(0);
        setFinished(true);
        if (!alertedRef.current) {
          alertedRef.current = true;
          setTimeout(() => alert('Countdown finished!'), 50);
        }
      } else {
        setRemaining(diff);
        setFinished(false);
        alertedRef.current = false;
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetStr]);

  // Track start time and total duration when targetStr changes
  useEffect(() => {
    const target = new Date(targetStr).getTime();
    if (isNaN(target)) return;
    const now = Date.now();
    const total = Math.round((target - now) / 1000);
    if (total > 0) {
      setStartTs(now);
      setTotalDuration(total);
    }
  }, [targetStr]);

  const applyPreset = (seconds) => {
    const t = new Date(Date.now() + seconds * 1000);
    setTargetStr(toLocalDatetimeString(t));
  };

  const { days, hours, minutes, seconds } = remaining !== null ? decompose(remaining) : { days: 0, hours: 1, minutes: 0, seconds: 0 };

  const elapsed = startTs && totalDuration
    ? Math.round((Date.now() - startTs) / 1000)
    : 0;
  const progress = totalDuration
    ? Math.min(100, Math.round((elapsed / totalDuration) * 100))
    : 0;

  const Unit = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="bg-gray-900 text-white rounded-2xl w-20 h-20 flex items-center justify-center text-3xl font-bold font-mono tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <span className="mt-2 text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
    </div>
  );

  return (
    <ToolLayout
      title="Countdown Timer"
      description="Count down to any future date or event. Live days, hours, minutes, seconds display."
      icon={<CountdownTimerIcon className="w-6 h-6" />}
      category="Utility"
      seoContent={seoContent}
    >
      {/* Presets */}
      <div className="card py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-gray-400 mr-1">Quick:</span>
          {PRESETS.map(p => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.seconds)}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-lg font-medium transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Target input */}
      <div className="card space-y-4">
        <div>
          <label className="label">Target Date & Time</label>
          <input
            type="datetime-local"
            className="input"
            value={targetStr}
            onChange={e => setTargetStr(e.target.value)}
          />
        </div>

        {/* Countdown display */}
        <div className={`flex justify-center gap-4 py-4 ${finished ? 'opacity-40' : ''}`}>
          <Unit value={days}    label="Days"    />
          <div className="text-3xl font-bold text-gray-300 self-center pb-6">:</div>
          <Unit value={hours}   label="Hours"   />
          <div className="text-3xl font-bold text-gray-300 self-center pb-6">:</div>
          <Unit value={minutes} label="Minutes" />
          <div className="text-3xl font-bold text-gray-300 self-center pb-6">:</div>
          <Unit value={seconds} label="Seconds" />
        </div>

        {finished && (
          <div className="text-center py-2">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 font-semibold rounded-xl text-sm">
              Countdown complete!
            </span>
          </div>
        )}

        {/* Progress bar */}
        {totalDuration && (
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Elapsed</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
