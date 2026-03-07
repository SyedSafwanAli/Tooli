import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import Alert from '../../components/common/Alert';
import { UrlParserIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli URL Parser breaks any URL into its individual components using the browser\'s native URL API. It separates protocol, hostname, port, pathname, and hash, and presents all query string parameters as a structured table — making it easy to inspect API endpoints, debug OAuth redirects, and understand complex URLs.',
  howTo: [
    'Paste or type a full URL into the input field (include the protocol, e.g. https://).',
    'Click "Parse URL" or press Enter to analyse it.',
    'View each component — protocol, host, port, path, query, and hash — in the results table.',
    'Query parameters are displayed in a separate key-value table for easy reading.',
  ],
  features: [
    'Parses protocol, hostname, port, pathname, search, and hash',
    'Query parameters displayed as a structured key-value table',
    'Handles both HTTP/HTTPS and other URL schemes',
    'Uses the browser\'s native URL API for 100% accurate parsing',
    'Highlights missing components (default port, empty hash)',
    'Click any query value to copy it',
  ],
  faq: [
    { q: 'What URL formats are supported?', a: 'The parser uses the browser\'s native URL API, supporting http, https, ftp, and any other scheme the browser recognises. Data URIs are also supported. The URL must include a protocol prefix.' },
    { q: 'What if my URL has no query parameters?', a: 'If there are no query parameters, the parameters table is hidden. Only the components section is shown, with "(none)" for empty fields like hash.' },
    { q: 'How are URL-encoded characters handled?', a: 'Query parameter values are automatically URL-decoded for display. For example, %20 is shown as a space and %26 as &. The raw encoded form is available in the Search row of the components table.' },
    { q: 'What is the difference between host and hostname?', a: 'hostname is just the domain name (e.g. example.com). host includes the port if non-default (e.g. example.com:8080). For standard HTTP/HTTPS ports (80/443), both are identical.' },
  ],
};

function parseUrl(raw) {
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    const params = [];
    url.searchParams.forEach((v, k) => params.push({ key: k, value: v }));
    return {
      href: url.href,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port || `(default for ${url.protocol.replace(':', '')})`,
      pathname: url.pathname || '/',
      search: url.search || '(none)',
      hash: url.hash || '(none)',
      origin: url.origin,
      params,
    };
  } catch {
    return null;
  }
}

export default function UrlParser() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copiedParam, setCopiedParam] = useState(null);

  useSEO({
    title: 'URL Parser',
    description: 'Parse any URL into protocol, host, path, query parameters, and hash. Free online URL analyzer and query string parser.',
    keywords: ['url parser', 'url analyzer', 'parse url', 'query string parser', 'url components', 'url inspector'],
    jsonLd: [
      buildToolSchema({ name: 'URL Parser', description: 'Parse and analyze URL components online for free', url: '/tools/url-parser' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/url-parser',
  });

  const parse = () => {
    setError('');
    setResult(null);
    if (!input.trim()) return;
    const parsed = parseUrl(input.trim());
    if (!parsed) {
      setError('Could not parse the URL. Make sure it is a valid URL (e.g. https://example.com/path?key=value).');
      return;
    }
    setResult(parsed);
  };

  const copyParam = async (key, value) => {
    await navigator.clipboard.writeText(value);
    setCopiedParam(key);
    setTimeout(() => setCopiedParam(null), 1500);
  };

  return (
    <ToolLayout
      title="URL Parser"
      description="Break down any URL into its individual components — protocol, host, path, query params, and hash."
      icon={<UrlParserIcon className="w-6 h-6" />}
      category="Developer"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        <div>
          <label className="label">URL</label>
          <input
            type="text"
            className="input font-mono text-sm"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && parse()}
            placeholder="https://api.example.com/v2/users?page=1&limit=20&sort=name#results"
            autoFocus
          />
        </div>
        <button
          onClick={parse}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
        >
          Parse URL
        </button>
      </div>

      {error && <Alert type="error" message={error} />}

      {result && (
        <div className="space-y-4">
          {/* Components table */}
          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-gray-900 text-sm">URL Components</h3>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {[
                  ['Protocol', result.protocol],
                  ['Host', result.host],
                  ['Hostname', result.hostname],
                  ['Port', result.port],
                  ['Pathname', result.pathname],
                  ['Search', result.search],
                  ['Hash', result.hash],
                  ['Origin', result.origin],
                ].map(([label, value]) => (
                  <tr key={label} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-gray-500 w-28 shrink-0">{label}</td>
                    <td className="py-2.5 px-4 font-mono text-gray-800 break-all">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Query params table */}
          {result.params.length > 0 && (
            <div className="card overflow-hidden p-0">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Query Parameters ({result.params.length})
                </h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left py-2 px-4 font-semibold">Key</th>
                    <th className="text-left py-2 px-4 font-semibold">Value</th>
                    <th className="w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {result.params.map(({ key, value }) => (
                    <tr key={key} className="hover:bg-purple-50 transition-colors group">
                      <td className="py-2.5 px-4 font-mono font-semibold text-purple-700">{key}</td>
                      <td className="py-2.5 px-4 font-mono text-gray-700 break-all">{value}</td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => copyParam(key, value)}
                          className="text-xs text-gray-400 group-hover:text-purple-600 transition-colors"
                        >
                          {copiedParam === key ? '✓' : 'copy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.params.length === 0 && (
            <p className="text-xs text-center text-gray-400">No query parameters found in this URL.</p>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
