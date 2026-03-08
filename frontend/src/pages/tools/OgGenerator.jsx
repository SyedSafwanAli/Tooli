import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { OgGeneratorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Open Graph Generator creates the complete set of Open Graph and Twitter Card meta tags needed for rich link previews on Facebook, LinkedIn, Twitter/X, and other social platforms. Fill in the fields and see a live preview before copying the code.',
  howTo: [
    'Select the OG type (website, article, product).',
    'Enter the title, description, image URL, and page URL.',
    'For articles, optionally add author, published time, and section.',
    'Copy the generated tags and paste them into your page <head>.',
  ],
  features: [
    'Full Open Graph tag set: og:title, og:description, og:image, og:url, og:type',
    'Twitter Card tags: summary_large_image format',
    'Article-specific tags: author, published_time, section',
    'Live social preview card',
    'Supports website, article, and product types',
    'Copy ready-to-paste HTML snippet',
  ],
  faq: [
    { q: 'What image size should I use for Open Graph?', a: 'The recommended size is 1200×630 pixels. Facebook will crop images smaller than 600×314. Use HTTPS URLs for best compatibility.' },
    { q: 'Do I need both OG tags and Twitter Card tags?', a: 'Twitter falls back to OG tags if Twitter Card tags are missing, but having both gives you explicit control over how your link appears on each platform.' },
    { q: 'What is og:type used for?', a: 'og:type tells social platforms what kind of content the page represents. "website" is the default. Use "article" for blog posts/news, which unlocks article-specific tags.' },
  ],
};

const OG_TYPES = ['website', 'article', 'product'];

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default function OgGenerator() {
  const [ogType, setOgType]       = useState('website');
  const [title, setTitle]         = useState('');
  const [description, setDesc]    = useState('');
  const [imageUrl, setImageUrl]   = useState('');
  const [pageUrl, setPageUrl]     = useState('');
  const [siteName, setSiteName]   = useState('');
  const [author, setAuthor]       = useState('');
  const [publishedTime, setPubTime] = useState('');
  const [section, setSection]     = useState('');
  const [twitterSite, setTwSite]  = useState('');

  useSEO({
    title: 'Open Graph Generator',
    description: 'Generate Open Graph and Twitter Card meta tags for rich social media previews. Free, instant, browser-based OG tag generator.',
    keywords: ['open graph generator', 'og tags', 'twitter card generator', 'social media meta tags', 'facebook meta tags'],
    jsonLd: [
      buildToolSchema({ name: 'Open Graph Generator', description: 'Generate Open Graph and Twitter Card meta tags for social sharing', url: '/tools/og-generator' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/og-generator',
  });

  const output = useMemo(() => {
    const lines = [];
    const e = escapeHtml;
    // Open Graph
    lines.push(`<!-- Open Graph -->`);
    lines.push(`<meta property="og:type" content="${e(ogType)}">`);
    if (title)       lines.push(`<meta property="og:title" content="${e(title)}">`);
    if (description) lines.push(`<meta property="og:description" content="${e(description)}">`);
    if (imageUrl)    lines.push(`<meta property="og:image" content="${e(imageUrl)}">`);
    if (pageUrl)     lines.push(`<meta property="og:url" content="${e(pageUrl)}">`);
    if (siteName)    lines.push(`<meta property="og:site_name" content="${e(siteName)}">`);
    // Article-specific
    if (ogType === 'article') {
      if (author)        lines.push(`<meta property="article:author" content="${e(author)}">`);
      if (publishedTime) lines.push(`<meta property="article:published_time" content="${e(publishedTime)}">`);
      if (section)       lines.push(`<meta property="article:section" content="${e(section)}">`);
    }
    // Twitter Card
    lines.push(`<!-- Twitter Card -->`);
    lines.push(`<meta name="twitter:card" content="summary_large_image">`);
    if (title)       lines.push(`<meta name="twitter:title" content="${e(title)}">`);
    if (description) lines.push(`<meta name="twitter:description" content="${e(description)}">`);
    if (imageUrl)    lines.push(`<meta name="twitter:image" content="${e(imageUrl)}">`);
    if (twitterSite) lines.push(`<meta name="twitter:site" content="${e(twitterSite.startsWith('@') ? twitterSite : '@' + twitterSite)}">`);
    return lines.join('\n');
  }, [ogType, title, description, imageUrl, pageUrl, siteName, author, publishedTime, section, twitterSite]);

  const hasContent = title || description;

  return (
    <ToolLayout
      title="Open Graph Generator"
      description="Generate Open Graph and Twitter Card meta tags for rich social media link previews."
      icon={<OgGeneratorIcon className="w-6 h-6" />}
      category="SEO"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        {/* Type */}
        <div>
          <label className="label">OG Type</label>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {OG_TYPES.map(t => (
              <button key={t} onClick={() => setOgType(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors capitalize ${ogType === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Core fields */}
        <div>
          <label className="label">Title</label>
          <input type="text" className="input" placeholder="My Page Title" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input resize-none text-sm" rows={2} placeholder="A description for social previews…" value={description} onChange={e => setDesc(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Image URL</label>
            <input type="url" className="input text-sm" placeholder="https://example.com/image.jpg" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
          </div>
          <div>
            <label className="label">Page URL</label>
            <input type="url" className="input text-sm" placeholder="https://example.com/page" value={pageUrl} onChange={e => setPageUrl(e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Site Name <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" className="input text-sm" placeholder="My Website" value={siteName} onChange={e => setSiteName(e.target.value)} />
          </div>
          <div>
            <label className="label">Twitter Handle <span className="text-gray-400 font-normal">(optional)</span></label>
            <input type="text" className="input text-sm" placeholder="@myhandle" value={twitterSite} onChange={e => setTwSite(e.target.value)} />
          </div>
        </div>

        {/* Article fields */}
        {ogType === 'article' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="label">Author</label>
              <input type="text" className="input text-sm" placeholder="Jane Doe" value={author} onChange={e => setAuthor(e.target.value)} />
            </div>
            <div>
              <label className="label">Published Time</label>
              <input type="datetime-local" className="input text-sm" value={publishedTime} onChange={e => setPubTime(e.target.value)} />
            </div>
            <div>
              <label className="label">Section</label>
              <input type="text" className="input text-sm" placeholder="Technology" value={section} onChange={e => setSection(e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Preview card */}
      {(title || description || imageUrl) && (
        <div className="card space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Preview</p>
          <div className="border border-gray-200 rounded-xl overflow-hidden max-w-sm">
            {imageUrl && (
              <img src={imageUrl} alt="" className="w-full h-40 object-cover" onError={e => { e.target.style.display = 'none'; }} />
            )}
            {!imageUrl && (
              <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-gray-300 text-sm">No image URL</span>
              </div>
            )}
            <div className="p-3 bg-gray-50">
              {pageUrl && <p className="text-xs text-gray-400 mb-0.5 truncate">{pageUrl.replace(/^https?:\/\//, '')}</p>}
              {title && <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>}
              {description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{description}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Output */}
      {hasContent && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Generated HTML</span>
            <ResultActions copyText={output} />
          </div>
          <pre className="bg-gray-900 text-green-400 text-xs font-mono rounded-xl p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {output}
          </pre>
        </div>
      )}

      {!hasContent && (
        <div className="card">
          <p className="text-xs text-gray-400 text-center py-2">Fill in the title or description to generate OG tags.</p>
        </div>
      )}
    </ToolLayout>
  );
}
