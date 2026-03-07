import { useState } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import { SlugGeneratorIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: [
    'The Tooli Slug Generator converts any text into a clean, URL-friendly slug. It lowercases all letters, replaces spaces and punctuation with the separator you choose, normalises accented characters (é → e, ñ → n), and strips anything that browsers cannot safely include in a URL without percent-encoding.',
    'Slugs matter for SEO because search engines read them to understand a page\'s topic. A clear slug like /best-image-compressor signals relevance far more effectively than /page?id=123. Consistent, lowercase, hyphen-separated slugs are recommended by Google\'s URL guidelines.',
  ],
  howTo: [
    'Type or paste any text — a title, headline, or phrase — into the input field.',
    'The slug updates in real time as you type.',
    'Choose your separator: hyphen (-) for web URLs, or underscore (_) for Python variables and database fields.',
    'Click "Copy" to copy the generated slug to your clipboard.',
  ],
  features: [
    'Real-time slug preview as you type',
    'Hyphen or underscore separator options',
    'Normalises Unicode and accented characters (é → e)',
    'Removes all non-alphanumeric characters',
    'Collapses multiple separators into one',
    'Trims leading and trailing separators',
    'One-click clipboard copy',
    'Runs entirely in your browser — zero server calls',
  ],
  faq: [
    { q: 'What is a URL slug?', a: 'A URL slug is the human-readable portion of a URL that identifies a page. In https://example.com/my-blog-post, the slug is "my-blog-post". Slugs are lowercase, contain no spaces, and use hyphens instead of special characters.' },
    { q: 'Why are slugs important for SEO?', a: 'Search engines read URL slugs to understand page content. A keyword-rich slug like /free-image-compressor is far more descriptive than /page?id=7, which can improve both rankings and click-through rate from search results.' },
    { q: 'Will accented characters be handled correctly?', a: 'Yes. The generator uses Unicode normalisation to convert characters to their ASCII base (e.g. café → cafe, über → uber) before building the slug.' },
    { q: 'When should I use underscores instead of hyphens?', a: 'Google officially recommends hyphens (-) for web URLs because they are treated as word separators, helping search engines understand the individual words. Underscores (_) are preferred for Python variable names, database column names, and some programming conventions.' },
  ],
};

function toSlug(text, sep) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, sep);
}

export default function SlugGenerator() {
  const [text, setText] = useState('');
  const [sep, setSep] = useState('-');
  const [copied, setCopied] = useState(false);

  useSEO({
    title: 'Slug Generator',
    description: 'Convert any text to a clean, SEO-friendly URL slug. Normalises accents, removes special characters, supports hyphen or underscore.',
    keywords: ['slug generator', 'url slug', 'permalink generator', 'seo slug', 'url-friendly text', 'slug converter'],
    jsonLd: [
      buildToolSchema({ name: 'Slug Generator', description: 'Convert text to URL-friendly slugs for SEO', url: '/tools/slug-generator', category: 'UtilitiesApplication' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/slug-generator',
  });

  const slug = toSlug(text, sep);

  const copy = async () => {
    if (!slug) return;
    await navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="Slug Generator"
      description="Convert any text into a clean, URL-friendly slug for SEO-optimised links."
      icon={<SlugGeneratorIcon className="w-6 h-6" />}
      category="Text"
      seoContent={seoContent}
    >
      <div className="card space-y-5">
        <div>
          <label className="label">Input Text</label>
          <input
            type="text"
            className="input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="e.g. My Awesome Blog Post — 2024!"
            autoFocus
          />
        </div>

        <div>
          <label className="label">Separator</label>
          <div className="flex gap-3">
            {[{ v: '-', label: 'Hyphen  (-)  — recommended for URLs' }, { v: '_', label: 'Underscore  (_)  — for variables' }].map(({ v, label }) => (
              <button
                key={v}
                onClick={() => setSep(v)}
                className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                  sep === v
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-blue-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {slug && (
          <div>
            <label className="label">Generated Slug</label>
            <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <code className="flex-1 text-sm text-blue-700 font-mono break-all">{slug}</code>
              <button
                onClick={copy}
                className="shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 hover:border-blue-400 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {!text && (
          <p className="text-xs text-gray-400 text-center">
            Start typing above to see your slug appear here.
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
