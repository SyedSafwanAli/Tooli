import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { UserAgentParserIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli User Agent Parser detects the browser name and version, operating system, device type, and rendering engine from any user agent string. It auto-detects your current browser\'s UA or you can paste any UA string to analyse it.',
  howTo: [
    'Your current browser\'s user agent is pre-loaded automatically.',
    'Click "Detect my UA" to refresh to the current browser UA.',
    'Or paste any custom UA string into the input field.',
    'The parsed browser, OS, device, and engine details appear below.',
  ],
  features: [
    'Detects browser: Chrome, Firefox, Safari, Edge, Opera, and more',
    'Detects OS: Windows, macOS, Linux, Android, iOS',
    'Identifies device type: Desktop, Mobile, Tablet',
    'Shows rendering engine: Blink, Gecko, WebKit, Trident',
    'Auto-detects your current browser on page load',
    '100% client-side — no data sent to server',
  ],
  faq: [
    { q: 'What is a user agent string?', a: 'A user agent (UA) string is a header sent by every browser with each HTTP request. It identifies the browser, version, operating system, and sometimes the device type to web servers.' },
    { q: 'Can I test mobile user agents?', a: 'Yes. Paste any mobile UA string (e.g. from an iPhone or Android device) and the tool will parse it correctly.' },
    { q: 'Is UA detection always accurate?', a: 'User agent strings can be spoofed and the format varies between browsers. The tool uses well-tested regex patterns but edge cases may be misidentified.' },
  ],
};

function parseUA(ua) {
  if (!ua) return null;

  // Browser detection (order matters)
  let browser = 'Unknown', browserVersion = '';
  const browsers = [
    { name: 'Edge (Chromium)', re: /Edg\/(\S+)/ },
    { name: 'Edge (Legacy)',   re: /Edge\/(\S+)/ },
    { name: 'Opera',           re: /OPR\/(\S+)/ },
    { name: 'Opera',           re: /Opera\/(\S+)/ },
    { name: 'Samsung Browser', re: /SamsungBrowser\/(\S+)/ },
    { name: 'Chrome',          re: /Chrome\/(\S+)/ },
    { name: 'Firefox',         re: /Firefox\/(\S+)/ },
    { name: 'Safari',          re: /Version\/(\S+).*Safari/ },
    { name: 'IE',              re: /MSIE\s(\S+);/ },
    { name: 'IE',              re: /Trident\/.*rv:([^)]+)/ },
  ];
  for (const b of browsers) {
    const m = ua.match(b.re);
    if (m) { browser = b.name; browserVersion = m[1]; break; }
  }

  // OS
  let os = 'Unknown', osVersion = '';
  const oses = [
    { name: 'Windows 11',  re: /Windows NT 10\.0.*Win64/ },
    { name: 'Windows 10',  re: /Windows NT 10\.0/ },
    { name: 'Windows 8.1', re: /Windows NT 6\.3/ },
    { name: 'Windows 8',   re: /Windows NT 6\.2/ },
    { name: 'Windows 7',   re: /Windows NT 6\.1/ },
    { name: 'Windows XP',  re: /Windows NT 5\.1/ },
    { name: 'Android',     re: /Android ([^;)]+)/ },
    { name: 'iOS',         re: /iPhone OS ([^;)]+)/ },
    { name: 'iPadOS',      re: /iPad.*OS ([^;)]+)/ },
    { name: 'macOS',       re: /Mac OS X ([^;)]+)/ },
    { name: 'Linux',       re: /Linux/ },
    { name: 'ChromeOS',    re: /CrOS/ },
  ];
  for (const o of oses) {
    const m = ua.match(o.re);
    if (m) {
      os = o.name;
      osVersion = m[1] ? m[1].replace(/_/g, '.') : '';
      break;
    }
  }

  // Device type
  let device = 'Desktop';
  if (/Mobi|Android|iPhone|Windows Phone/i.test(ua)) device = 'Mobile';
  else if (/iPad|Tablet/i.test(ua)) device = 'Tablet';
  else if (/TV|SmartTV|HbbTV/i.test(ua)) device = 'Smart TV';
  else if (/Bot|Crawler|Spider|Scraper/i.test(ua)) device = 'Bot/Crawler';

  // Engine
  let engine = 'Unknown';
  if (/Gecko\//.test(ua) && !/like Gecko/.test(ua.replace(/WebKit/,''))) engine = 'Gecko';
  else if (/AppleWebKit\//i.test(ua) && !/Chromium|Chrome/.test(ua)) engine = 'WebKit';
  else if (/Chromium|Chrome|CriOS|Edg\/|OPR\//.test(ua)) engine = 'Blink';
  else if (/Trident\//.test(ua)) engine = 'Trident (IE)';

  return { browser, browserVersion, os, osVersion, device, engine, raw: ua };
}

const SAMPLES = [
  { label: 'Chrome / Windows',  ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
  { label: 'Firefox / Linux',   ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0' },
  { label: 'Safari / macOS',    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15' },
  { label: 'iPhone / iOS',      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' },
  { label: 'Googlebot',         ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
];

const FIELD_ICONS = { browser: '🌐', browserVersion: '#', os: '💻', osVersion: '#', device: '📱', engine: '⚙️' };

export default function UserAgentParser() {
  const [ua, setUa] = useState(navigator.userAgent);

  useSEO({
    title: 'User Agent Parser',
    description: 'Parse any user agent string — detect browser, OS, device type, and engine. Auto-detects your current browser. Free, browser-based.',
    keywords: ['user agent parser', 'browser detector', 'user agent string parser', 'detect browser from ua', 'parse user agent'],
    jsonLd: [
      buildToolSchema({ name: 'User Agent Parser', description: 'Parse user agent strings to detect browser, OS, device type, and engine', url: '/tools/user-agent-parser' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/user-agent-parser',
  });

  const result = useMemo(() => parseUA(ua), [ua]);

  const InfoRow = ({ label, value }) => value ? (
    <div className="flex items-start gap-3 px-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 w-32 shrink-0 mt-0.5">{label}</span>
      <span className="text-sm font-medium text-gray-800 break-words">{value}</span>
    </div>
  ) : null;

  return (
    <ToolLayout
      title="User Agent Parser"
      description="Parse any user agent string to identify browser, OS, device type, and rendering engine."
      icon={<UserAgentParserIcon className="w-6 h-6" />}
      category="Utility"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        {/* UA Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label">User Agent String</label>
            <button onClick={() => setUa(navigator.userAgent)} className="text-xs text-blue-600 hover:underline">
              Detect my UA
            </button>
          </div>
          <textarea
            className="input font-mono text-xs resize-none"
            rows={3}
            value={ua}
            onChange={e => setUa(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Sample UAs */}
        <div>
          <p className="text-xs text-gray-400 mb-2">Samples:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map(s => (
              <button key={s.label} onClick={() => setUa(s.ua)}
                className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 rounded-lg transition-colors">
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <InfoRow label="Browser" value={result.browser} />
            <InfoRow label="Browser Version" value={result.browserVersion} />
            <InfoRow label="Operating System" value={result.os} />
            <InfoRow label="OS Version" value={result.osVersion} />
            <InfoRow label="Device Type" value={result.device} />
            <InfoRow label="Rendering Engine" value={result.engine} />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
