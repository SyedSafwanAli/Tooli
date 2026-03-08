import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { AgeCalculatorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Age Calculator instantly computes your exact age in years, months, and days from your date of birth. It also shows what day of the week you were born and how many days until your next birthday. Everything runs in your browser — no data is sent to any server.',
  howTo: [
    'Enter your date of birth in the "Date of Birth" field.',
    'Optionally change the "As of" date (defaults to today) to calculate age at a specific past or future date.',
    'Your age in years, months, and days is shown instantly.',
    'See your birth day-of-week and next birthday countdown below.',
  ],
  features: [
    'Exact age in years, months, and days',
    'Day of the week you were born',
    'Days until your next birthday',
    'Calculate age as of any custom date',
    'Works for past and future dates',
    '100% client-side — no data sent to server',
  ],
  faq: [
    { q: 'How accurate is the age calculation?', a: 'The calculator accounts for varying month lengths and leap years, giving you the exact number of full years, remaining months, and remaining days.' },
    { q: 'Can I calculate age as of a past or future date?', a: 'Yes. Change the "As of" date to any date you like. The tool recalculates instantly.' },
    { q: 'What if I enter a future date of birth?', a: 'The tool will show a negative age, indicating the date is in the future. The result will read "Not born yet".' },
  ],
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function calcAge(dobStr, asOfStr) {
  if (!dobStr || !asOfStr) return null;
  const dob = new Date(dobStr);
  const asOf = new Date(asOfStr);
  if (isNaN(dob) || isNaN(asOf)) return null;
  if (asOf < dob) return { future: true };

  let years = asOf.getFullYear() - dob.getFullYear();
  let months = asOf.getMonth() - dob.getMonth();
  let days = asOf.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((asOf - dob) / 86400000);

  // Next birthday
  const thisYear = asOf.getFullYear();
  let nextBirthday = new Date(thisYear, dob.getMonth(), dob.getDate());
  if (nextBirthday <= asOf) nextBirthday = new Date(thisYear + 1, dob.getMonth(), dob.getDate());
  const daysToNext = Math.ceil((nextBirthday - asOf) / 86400000);

  return {
    future: false,
    years, months, days, totalDays,
    birthDayName: DAYS[dob.getDay()],
    daysToNext,
    nextBirthdayYear: nextBirthday.getFullYear(),
  };
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AgeCalculator() {
  const [dob, setDob] = useState('');
  const [asOf, setAsOf] = useState(todayStr());

  useSEO({
    title: 'Age Calculator',
    description: 'Calculate your exact age in years, months, and days. Find your birth day of week and days until next birthday. Free, instant, browser-based.',
    keywords: ['age calculator', 'how old am i', 'age in days', 'birthday calculator', 'exact age calculator'],
    jsonLd: [
      buildToolSchema({ name: 'Age Calculator', description: 'Calculate exact age in years, months, and days from date of birth', url: '/tools/age-calculator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/age-calculator',
  });

  const result = useMemo(() => calcAge(dob, asOf), [dob, asOf]);

  const StatBox = ({ value, label }) => (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
      <div className="text-3xl font-bold text-gray-900 tabular-nums">{value}</div>
      <div className="text-xs text-gray-400 mt-1 font-medium uppercase tracking-wide">{label}</div>
    </div>
  );

  return (
    <ToolLayout
      title="Age Calculator"
      description="Calculate your exact age in years, months, and days from your date of birth."
      icon={<AgeCalculatorIcon className="w-6 h-6" />}
      category="Calculator"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Date of Birth</label>
            <input
              type="date"
              className="input"
              value={dob}
              max={asOf}
              onChange={e => setDob(e.target.value)}
            />
          </div>
          <div>
            <label className="label">As of Date</label>
            <input
              type="date"
              className="input"
              value={asOf}
              onChange={e => setAsOf(e.target.value)}
            />
          </div>
        </div>

        {/* Results */}
        {result === null && (
          <p className="text-xs text-gray-400 text-center py-2">Enter your date of birth to calculate your age.</p>
        )}

        {result?.future && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 text-center font-medium">
            The date of birth is in the future — not born yet.
          </div>
        )}

        {result && !result.future && (
          <>
            {/* Main age */}
            <div className="grid grid-cols-3 gap-3">
              <StatBox value={result.years}  label="Years"  />
              <StatBox value={result.months} label="Months" />
              <StatBox value={result.days}   label="Days"   />
            </div>

            {/* Extra info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                <div className="font-bold text-blue-700 text-lg tabular-nums">{result.totalDays.toLocaleString()}</div>
                <div className="text-blue-400 text-xs mt-0.5">Total Days Lived</div>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-center">
                <div className="font-bold text-purple-700 text-base">{result.birthDayName}</div>
                <div className="text-purple-400 text-xs mt-0.5">Born On</div>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <div className="font-bold text-green-700 text-lg tabular-nums">
                  {result.daysToNext === 0 ? '🎂 Today!' : result.daysToNext}
                </div>
                <div className="text-green-400 text-xs mt-0.5">
                  {result.daysToNext === 0 ? 'Happy Birthday!' : `Days to Birthday (${result.nextBirthdayYear})`}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </ToolLayout>
  );
}
