import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { SitemapGeneratorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli XML Sitemap Generator creates a valid sitemap.xml file from a list of URLs you provide. Set priority and change frequency per URL, or apply defaults to all. Download the finished file and submit it to Google Search Console.',
  howTo: [
    'Enter your website URLs one per line in the input — or paste a list.',
    'Set default priority and change frequency for all URLs.',
    'Optionally override priority/changefreq per individual URL.',
    'Download sitemap.xml and upload it to your website root.',
  ],
  features: [
    'Paste any number of URLs — one per line',
    'Set changefreq: always, hourly, daily, weekly, monthly, yearly, never',
    'Set priority: 0.0 – 1.0 per URL',
    'Auto-formats lastmod date to today',
    'Validates URL format before generating',
    'Download as sitemap.xml file',
  ],
  faq: [
    { q: 'Where do I submit a sitemap?', a: 'Upload sitemap.xml to your website root (https://yourdomain.com/sitemap.xml), then submit the URL in Google Search Console under Sitemaps.' },
    { q: 'How many URLs can a sitemap have?', a: 'A single sitemap file can contain a maximum of 50,000 URLs and must not exceed 50 MB uncompressed. For larger sites, use a sitemap index file.' },
    { q: 'What priority should I use?', a: 'Priority hints at the relative importance of your pages. The homepage is typically 1.0, main section pages 0.8–0.9, and individual posts/articles 0.6–0.7. Search engines may not use priority directly.' },
  ],
};

const CHANGEFREQ_OPTIONS = ['always','hourly','daily','weekly','monthly','yearly','never'];

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function isValidUrl(str) {
  try { new URL(str); return true; } catch { return false; }
}

function todayIso() {
  return new Date().toISOString().split('T')[0];
}

function buildSitemap(entries) {
  const today = todayIso();
  const urlElems = entries
    .filter(e => e.url.trim() && isValidUrl(e.url.trim()))
    .map(e => [
      `  <url>`,
      `    <loc>${escapeXml(e.url.trim())}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${parseFloat(e.priority).toFixed(1)}</priority>`,
      `  </url>`,
    ].join('\n'));

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urlElems,
    `</urlset>`,
  ].join('\n');
}

let nextId = 1;

const SAMPLE_URLS = `https://example.com/
https://example.com/about
https://example.com/blog
https://example.com/contact`;

export default function SitemapGenerator() {
  const [bulkInput, setBulkInput]     = useState('');
  const [defaultFreq, setDefaultFreq] = useState('monthly');
  const [defaultPrio, setDefaultPrio] = useState('0.8');
  const [entries, setEntries]         = useState([]);
  const [parsed, setParsed]           = useState(false);

  useSEO({
    title: 'XML Sitemap Generator',
    description: 'Generate a valid XML sitemap from a list of URLs. Set priority and changefreq. Download sitemap.xml instantly. Free, browser-based sitemap generator.',
    keywords: ['xml sitemap generator', 'sitemap creator', 'sitemap.xml generator', 'seo sitemap', 'google sitemap generator'],
    jsonLd: [
      buildToolSchema({ name: 'XML Sitemap Generator', description: 'Generate an XML sitemap from a list of URLs with priority and changefreq', url: '/tools/sitemap-generator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/sitemap-generator',
  });

  const parseUrls = () => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(Boolean);
    const newEntries = lines.map(url => ({
      id: nextId++,
      url,
      changefreq: defaultFreq,
      priority: defaultPrio,
      valid: isValidUrl(url),
    }));
    setEntries(newEntries);
    setParsed(true);
  };

  const updateEntry = (id, field, value) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEntry = (id) => setEntries(prev => prev.filter(e => e.id !== id));

  const validEntries = entries.filter(e => e.valid);

  const output = useMemo(() => validEntries.length > 0 ? buildSitemap(validEntries) : '', [validEntries]);

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'application/xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <ToolLayout
      title="XML Sitemap Generator"
      description="Generate a valid sitemap.xml from a list of URLs. Set priority and changefreq per URL, then download."
      icon={<SitemapGeneratorIcon className="w-6 h-6" />}
      category="SEO"
      seoContent={seoContent}
    >
      {/* Step 1: URL input */}
      <div className="card space-y-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Step 1 — Paste URLs</p>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label">URLs (one per line)</label>
            <button onClick={() => setBulkInput(SAMPLE_URLS)} className="text-xs text-blue-600 hover:underline">
              Load sample
            </button>
          </div>
          <textarea
            className="input text-sm font-mono resize-none"
            rows={6}
            placeholder="https://example.com/&#10;https://example.com/about&#10;https://example.com/blog"
            value={bulkInput}
            onChange={e => { setBulkInput(e.target.value); setParsed(false); }}
            spellCheck={false}
          />
        </div>

        {/* Defaults */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Default Change Frequency</label>
            <select className="input text-sm" value={defaultFreq} onChange={e => setDefaultFreq(e.target.value)}>
              {CHANGEFREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Default Priority</label>
            <select className="input text-sm" value={defaultPrio} onChange={e => setDefaultPrio(e.target.value)}>
              {['1.0','0.9','0.8','0.7','0.6','0.5','0.4','0.3','0.2','0.1','0.0'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={parseUrls}
          disabled={!bulkInput.trim()}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          Parse URLs ({bulkInput.split('\n').filter(l => l.trim()).length} URLs)
        </button>
      </div>

      {/* Step 2: Review entries */}
      {parsed && entries.length > 0 && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Step 2 — Review ({validEntries.length} valid · {entries.length - validEntries.length} invalid)
            </p>
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {entries.map(e => (
              <div key={e.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${e.valid ? 'bg-gray-50' : 'bg-red-50'}`}>
                <span className={`text-xs shrink-0 ${e.valid ? 'text-green-500' : 'text-red-400'}`}>{e.valid ? '✓' : '✗'}</span>
                <span className="text-xs font-mono text-gray-700 flex-1 truncate">{e.url}</span>
                {e.valid && (
                  <>
                    <select
                      className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white"
                      value={e.changefreq}
                      onChange={ev => updateEntry(e.id, 'changefreq', ev.target.value)}
                    >
                      {CHANGEFREQ_OPTIONS.map(f => <option key={f}>{f}</option>)}
                    </select>
                    <select
                      className="text-xs border border-gray-200 rounded px-1 py-0.5 bg-white w-14"
                      value={e.priority}
                      onChange={ev => updateEntry(e.id, 'priority', ev.target.value)}
                    >
                      {['1.0','0.9','0.8','0.7','0.6','0.5','0.4','0.3','0.2','0.1','0.0'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </>
                )}
                <button onClick={() => removeEntry(e.id)} className="text-gray-300 hover:text-red-400 text-base leading-none shrink-0">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">sitemap.xml</span>
            <ResultActions copyText={output} onDownload={handleDownload} downloadLabel="Download sitemap.xml" />
          </div>
          <pre className="bg-gray-900 text-green-400 text-xs font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-72">
            {output}
          </pre>
        </div>
      )}

      {!bulkInput.trim() && (
        <div className="card">
          <p className="text-xs text-gray-400 text-center py-2">Paste your URLs above to generate a sitemap.xml.</p>
        </div>
      )}
    </ToolLayout>
  );
}
