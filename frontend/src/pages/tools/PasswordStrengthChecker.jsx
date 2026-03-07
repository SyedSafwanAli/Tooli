import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { PasswordStrengthIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Password Strength Checker analyses your password against NIST and OWASP guidelines — checking length, character variety, common patterns, and estimated crack time. Your password is never sent to any server; all analysis runs locally in your browser.',
  howTo: [
    'Type or paste your password into the input field.',
    'The strength score, label, and detailed feedback update instantly.',
    'Review the checklist to see which criteria your password meets.',
    'Adjust your password until it reaches Strong or Very Strong.',
  ],
  features: [
    'Scores password on 6 criteria: length, uppercase, lowercase, digits, symbols, uniqueness',
    'Estimated crack time (brute-force at 10 billion guesses/second)',
    'Warns about common patterns: keyboard walks, repeated chars, dictionary words',
    'Colour-coded strength meter: Very Weak / Weak / Fair / Strong / Very Strong',
    '100% client-side — password never leaves your device',
    'Show/hide password toggle',
  ],
  faq: [
    { q: 'Is my password stored or sent anywhere?', a: 'No. All analysis happens in your browser using JavaScript. Your password is never transmitted to our servers.' },
    { q: 'How is crack time estimated?', a: 'We estimate the search space size based on character set and length, then divide by 10 billion guesses per second — a realistic rate for modern offline attacks using GPUs.' },
    { q: 'What makes a strong password?', a: 'At least 12 characters, mixing uppercase, lowercase, numbers, and symbols. Avoid dictionary words, keyboard patterns (qwerty, 12345), and repeating characters. A passphrase of 4+ random words is also very strong.' },
  ],
};

const COMMON_PATTERNS = [
  /^(password|passw0rd|p@ssword|p@ssw0rd)$/i,
  /^(123456|1234567|12345678|123456789|1234567890)$/,
  /^(qwerty|qwertyuiop|asdfgh|zxcvbn)$/i,
  /^(abc123|letmein|welcome|monkey|dragon|master|admin)$/i,
  /(.)\1{3,}/, // 4+ repeated chars
  /^(0000|1111|2222|3333|4444|5555|6666|7777|8888|9999)$/,
];

const KEYBOARD_WALKS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1234567890', 'qwerty', 'asdfgh'];

function estimateCrackTime(password) {
  let charsetSize = 0;
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;
  if (charsetSize === 0) return 'instant';

  const combinations = Math.pow(charsetSize, password.length);
  const guessesPerSecond = 1e10; // 10 billion/s (GPU attack)
  const seconds = combinations / guessesPerSecond;

  if (seconds < 1)        return 'instant';
  if (seconds < 60)       return `${Math.round(seconds)} seconds`;
  if (seconds < 3600)     return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400)    return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2_592_000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31_536_000) return `${Math.round(seconds / 2_592_000)} months`;
  if (seconds < 3_153_600_000) return `${Math.round(seconds / 31_536_000)} years`;
  return `${(seconds / 31_536_000).toExponential(1)} years`;
}

function analysePassword(password) {
  if (!password) return null;

  const checks = {
    length12:    password.length >= 12,
    length8:     password.length >= 8,
    uppercase:   /[A-Z]/.test(password),
    lowercase:   /[a-z]/.test(password),
    digit:       /[0-9]/.test(password),
    symbol:      /[^a-zA-Z0-9]/.test(password),
    noRepeating: !/(.)\1{3,}/.test(password),
  };

  const uniqueChars = new Set(password).size;
  const uniquenessRatio = uniqueChars / password.length;

  const warnings = [];
  if (COMMON_PATTERNS.some(p => p.test(password))) warnings.push('Matches a common password pattern');
  if (KEYBOARD_WALKS.some(w => password.toLowerCase().includes(w))) warnings.push('Contains a keyboard walk sequence');
  if (uniquenessRatio < 0.5 && password.length >= 8) warnings.push('Too many repeated characters');
  if (password.length < 8) warnings.push('Password is too short (minimum 8 characters recommended)');

  // Score 0–100
  let score = 0;
  if (password.length >= 6)  score += 10;
  if (password.length >= 8)  score += 15;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (checks.uppercase) score += 10;
  if (checks.lowercase) score += 10;
  if (checks.digit)     score += 10;
  if (checks.symbol)    score += 15;
  if (uniquenessRatio >= 0.7) score += 5;
  if (COMMON_PATTERNS.some(p => p.test(password))) score = Math.min(score, 20);
  if (KEYBOARD_WALKS.some(w => password.toLowerCase().includes(w))) score = Math.min(score, 30);

  score = Math.min(100, score);

  let label, color, barColor;
  if (score < 20)       { label = 'Very Weak'; color = 'text-red-600';    barColor = 'bg-red-500'; }
  else if (score < 40)  { label = 'Weak';      color = 'text-orange-600'; barColor = 'bg-orange-400'; }
  else if (score < 60)  { label = 'Fair';      color = 'text-yellow-600'; barColor = 'bg-yellow-400'; }
  else if (score < 80)  { label = 'Strong';    color = 'text-green-600';  barColor = 'bg-green-500'; }
  else                  { label = 'Very Strong'; color = 'text-emerald-600'; barColor = 'bg-emerald-500'; }

  return { score, label, color, barColor, checks, warnings, crackTime: estimateCrackTime(password), length: password.length };
}

const CheckItem = ({ pass, text }) => (
  <div className={`flex items-center gap-2 text-sm ${pass ? 'text-green-700' : 'text-gray-400'}`}>
    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${pass ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
      {pass ? '✓' : '·'}
    </span>
    {text}
  </div>
);

export default function PasswordStrengthChecker() {
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

  useSEO({
    title: 'Password Strength Checker',
    description: 'Check how strong your password is. Instant score, crack time estimate, and improvement tips. Runs locally — password never sent to server.',
    keywords: ['password strength checker', 'password strength meter', 'how strong is my password', 'password security check'],
    jsonLd: [
      buildToolSchema({ name: 'Password Strength Checker', description: 'Analyse password strength with score, crack time, and improvement tips', url: '/tools/password-strength' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/password-strength',
  });

  const result = useMemo(() => analysePassword(password), [password]);

  return (
    <ToolLayout
      title="Password Strength Checker"
      description="Analyse password strength instantly. Score, crack time estimate, and improvement tips — fully client-side."
      icon={<PasswordStrengthIcon className="w-6 h-6" />}
      category="Security"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        {/* Input */}
        <div>
          <label className="label">Your Password</label>
          <div className="relative">
            <input
              type={show ? 'text' : 'password'}
              className="input pr-12"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Type or paste your password…"
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm font-medium"
              tabIndex={-1}
            >
              {show ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        {result && (
          <>
            {/* Strength bar */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className={`text-sm font-bold ${result.color}`}>{result.label}</span>
                <span className="text-xs text-gray-400">{result.score}/100</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${result.barColor}`}
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <div className="font-bold text-gray-900 text-lg">{result.length}</div>
                <div className="text-gray-400 text-xs mt-0.5">Characters</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <div className={`font-bold text-lg ${result.color}`}>{result.label}</div>
                <div className="text-gray-400 text-xs mt-0.5">Strength</div>
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                <div className="font-bold text-gray-900 text-sm leading-tight">{result.crackTime}</div>
                <div className="text-gray-400 text-xs mt-0.5">Crack time</div>
              </div>
            </div>

            {/* Criteria checklist */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Criteria</p>
              <CheckItem pass={result.checks.length12}  text="At least 12 characters" />
              <CheckItem pass={result.checks.length8}   text="At least 8 characters" />
              <CheckItem pass={result.checks.uppercase} text="Contains uppercase letters (A-Z)" />
              <CheckItem pass={result.checks.lowercase} text="Contains lowercase letters (a-z)" />
              <CheckItem pass={result.checks.digit}     text="Contains numbers (0-9)" />
              <CheckItem pass={result.checks.symbol}    text="Contains symbols (!@#$…)" />
              <CheckItem pass={result.checks.noRepeating} text="No 4+ repeated characters" />
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Warnings</p>
                {result.warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    {w}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!password && (
          <p className="text-xs text-gray-400 text-center py-2">Type a password above to check its strength.</p>
        )}
      </div>
    </ToolLayout>
  );
}
