import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { RobotsGeneratorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Robots.txt Generator helps you build a valid robots.txt file by adding rules visually. Control which bots can crawl which paths, add your sitemap URL, and set a crawl delay — then copy or download the finished file.',
  howTo: [
    'Add one or more rules by selecting a bot, directive (Allow/Disallow), and path.',
    'Optionally enter your sitemap URL and a crawl delay.',
    'The robots.txt file is generated and updated live below.',
    'Copy or download the file and place it at the root of your website.',
  ],
  features: [
    'Add unlimited Allow/Disallow rules per user-agent',
    'Supports wildcard (*) for all bots or specific crawlers',
    'Common bot presets: Googlebot, Bingbot, GPTBot, CCBot',
    'Sitemap URL directive',
    'Crawl-delay directive',
    'Download as robots.txt file',
  ],
  faq: [
    { q: 'Where do I put robots.txt?', a: 'Place the file at the root of your domain: https://yourdomain.com/robots.txt. It must be accessible without authentication.' },
    { q: 'Does Disallow stop all bots?', a: 'No — robots.txt is an advisory file. Well-behaved crawlers respect it, but malicious bots may ignore it. It is not a security mechanism.' },
    { q: 'What does the wildcard (*) user-agent mean?', a: 'User-agent: * applies to all crawlers that do not have a specific rule set. It is the most common pattern and is always processed last.' },
  ],
};

const BOTS = ['*', 'Googlebot', 'Bingbot', 'GPTBot', 'CCBot', 'AhrefsBot', 'SemrushBot'];
const DIRECTIVES = ['Disallow', 'Allow'];

function buildRobots(rules, sitemapUrl, crawlDelay) {
  // Group rules by user-agent
  const groups = {};
  rules.forEach(r => {
    if (!groups[r.bot]) groups[r.bot] = [];
    groups[r.bot].push(r);
  });

  const lines = [];
  Object.entries(groups).forEach(([bot, botRules]) => {
    lines.push(`User-agent: ${bot}`);
    if (crawlDelay) lines.push(`Crawl-delay: ${crawlDelay}`);
    botRules.forEach(r => lines.push(`${r.directive}: ${r.path || '/'}`));
    lines.push('');
  });
  if (sitemapUrl) lines.push(`Sitemap: ${sitemapUrl}`);
  return lines.join('\n').trim();
}

let nextId = 1;

export default function RobotsGenerator() {
  const [rules, setRules] = useState([
    { id: nextId++, bot: '*', directive: 'Disallow', path: '/admin/' },
    { id: nextId++, bot: '*', directive: 'Allow', path: '/' },
  ]);
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [crawlDelay, setCrawlDelay] = useState('');
  const [newBot, setNewBot] = useState('*');
  const [newDir, setNewDir] = useState('Disallow');
  const [newPath, setNewPath] = useState('');

  useSEO({
    title: 'Robots.txt Generator',
    description: 'Build a robots.txt file visually. Add Allow/Disallow rules, sitemap URL, and crawl delay. Free, instant, browser-based robots.txt generator.',
    keywords: ['robots.txt generator', 'robots txt creator', 'disallow googlebot', 'crawl rules', 'seo robots file'],
    jsonLd: [
      buildToolSchema({ name: 'Robots.txt Generator', description: 'Generate a robots.txt file with Allow/Disallow rules and sitemap URL', url: '/tools/robots-generator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/robots-generator',
  });

  const output = useMemo(() => buildRobots(rules, sitemapUrl, crawlDelay), [rules, sitemapUrl, crawlDelay]);

  const addRule = () => {
    if (!newPath.trim()) return;
    setRules(prev => [...prev, { id: nextId++, bot: newBot, directive: newDir, path: newPath.trim() }]);
    setNewPath('');
  };

  const removeRule = (id) => setRules(prev => prev.filter(r => r.id !== id));

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'robots.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <ToolLayout
      title="Robots.txt Generator"
      description="Build a robots.txt file visually — add crawl rules, sitemap URL, and crawl delay."
      icon={<RobotsGeneratorIcon className="w-6 h-6" />}
      category="SEO"
      seoContent={seoContent}
    >
      {/* Rules builder */}
      <div className="card space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Crawl Rules</p>

        {/* Existing rules */}
        <div className="space-y-2">
          {rules.map(r => (
            <div key={r.id} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm">
              <span className="text-blue-600 font-mono text-xs w-20 shrink-0">{r.bot}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded ${r.directive === 'Allow' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                {r.directive}
              </span>
              <span className="font-mono text-xs text-gray-600 flex-1 truncate">{r.path}</span>
              <button onClick={() => removeRule(r.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none ml-auto shrink-0">×</button>
            </div>
          ))}
        </div>

        {/* Add rule form */}
        <div className="flex gap-2 flex-wrap items-end border-t border-gray-100 pt-4">
          <div>
            <label className="label text-xs">User-agent</label>
            <select className="input text-sm py-1.5" value={newBot} onChange={e => setNewBot(e.target.value)}>
              {BOTS.map(b => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Directive</label>
            <select className="input text-sm py-1.5" value={newDir} onChange={e => setNewDir(e.target.value)}>
              {DIRECTIVES.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-32">
            <label className="label text-xs">Path</label>
            <input
              type="text"
              className="input text-sm"
              placeholder="/path/"
              value={newPath}
              onChange={e => setNewPath(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addRule()}
            />
          </div>
          <button
            onClick={addRule}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Add Rule
          </button>
        </div>
      </div>

      {/* Sitemap + Crawl delay */}
      <div className="card space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Sitemap URL <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="url" className="input text-sm" placeholder="https://example.com/sitemap.xml" value={sitemapUrl} onChange={e => setSitemapUrl(e.target.value)} />
          </div>
          <div>
            <label className="label">Crawl Delay (seconds) <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="number" min="0" className="input text-sm" placeholder="10" value={crawlDelay} onChange={e => setCrawlDelay(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">robots.txt</span>
          <div className="flex gap-2">
            <ResultActions copyText={output} onDownload={handleDownload} downloadLabel="Download robots.txt" />
          </div>
        </div>
        <pre className="bg-gray-900 text-green-400 text-xs font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed min-h-24">
          {output}
        </pre>
      </div>
    </ToolLayout>
  );
}
