import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { HtmlToTextIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli HTML to Plain Text converter strips all HTML tags from markup and extracts the readable text content. It uses the browser\'s built-in DOM parser so all standard HTML entities (&amp;, &nbsp;, &lt;, etc.) are automatically decoded. No data leaves your device.',
  howTo: [
    'Paste your HTML markup into the input field.',
    'The plain text output appears automatically.',
    'Toggle "Preserve line breaks" to insert newlines at block-level elements (p, div, br, headings).',
    'Click "Copy" to copy the result or "Download" to save as a .txt file.',
  ],
  features: [
    'Strips all HTML tags using browser-native DOMParser',
    'Automatically decodes HTML entities (&amp; → &, &nbsp; → space)',
    'Optional block element → newline conversion for readable output',
    'Shows input tag count and output character count',
    'Copy result or download as .txt',
    'Safe: runs in a sandboxed parser — scripts are not executed',
  ],
  faq: [
    { q: 'Is it safe to paste untrusted HTML here?', a: 'Yes. The converter uses DOMParser in a sandboxed context. Scripts in the HTML are parsed but never executed. Only the text content is extracted.' },
    { q: 'Why are spaces or line breaks different from what I expected?', a: 'By default browsers collapse whitespace in HTML (as per the HTML spec). Enable "Preserve line breaks" to insert newlines at p, div, br, h1-h6, and li elements before text extraction.' },
    { q: 'Does it handle HTML entities?', a: 'Yes. The browser DOM parser decodes all standard HTML entities — named (&amp;, &copy;, &nbsp;), decimal (&#169;), and hexadecimal (&#x00A9;) — automatically.' },
  ],
};

const SAMPLE = `<h1>Welcome to Tooli</h1>
<p>Tooli is a collection of <strong>free online tools</strong> for developers and creators.</p>
<ul>
  <li>Image compression &amp; conversion</li>
  <li>PDF tools</li>
  <li>Developer utilities</li>
</ul>
<p>Visit us at <a href="https://tooli.app">tooli.app</a> &mdash; no signup required.</p>`;

function htmlToPlainText(html, preserveLineBreaks) {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  if (preserveLineBreaks) {
    const BLOCK_TAGS = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TR', 'BLOCKQUOTE', 'PRE'];
    const walker = document.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
    const nodes = [];
    let node = walker.nextNode();
    while (node) { nodes.push(node); node = walker.nextNode(); }
    for (const el of nodes) {
      if (BLOCK_TAGS.includes(el.tagName) || el.tagName === 'BR') {
        el.insertAdjacentText('beforebegin', '\n');
      }
    }
  }

  return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
}

export default function HtmlToText() {
  const [html, setHtml] = useState('');
  const [preserveLineBreaks, setPreserveLineBreaks] = useState(true);

  useSEO({
    title: 'HTML to Plain Text',
    description: 'Strip HTML tags and extract plain text from any HTML. Free browser tool — decodes entities, optionally preserves line breaks.',
    keywords: ['html to text', 'strip html tags', 'html to plain text', 'remove html', 'html parser online'],
    jsonLd: [
      buildToolSchema({ name: 'HTML to Plain Text', description: 'Strip HTML tags and extract readable plain text', url: '/tools/html-to-text' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/html-to-text',
  });

  const { text, tagCount } = useMemo(() => {
    if (!html.trim()) return { text: '', tagCount: 0 };
    const tags = (html.match(/<[^>]+>/g) || []).length;
    return {
      text: htmlToPlainText(html, preserveLineBreaks),
      tagCount: tags,
    };
  }, [html, preserveLineBreaks]);

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plain-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="HTML to Plain Text"
      description="Strip all HTML tags and extract readable text. Decodes entities automatically."
      icon={<HtmlToTextIcon className="w-6 h-6" />}
      category="Text"
      seoContent={seoContent}
    >
      <div className="card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div
              onClick={() => setPreserveLineBreaks(b => !b)}
              className={`relative w-9 h-5 rounded-full transition-colors ${preserveLineBreaks ? 'bg-green-600' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${preserveLineBreaks ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-gray-700">Preserve line breaks</span>
          </label>
          <button
            onClick={() => setHtml(SAMPLE)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600 font-medium transition-colors"
          >
            Load Sample
          </button>
        </div>

        <div>
          <label className="label">HTML Input</label>
          <textarea
            className="input resize-none font-mono text-sm"
            rows={8}
            value={html}
            onChange={e => setHtml(e.target.value)}
            placeholder="Paste your HTML here…"
          />
        </div>
      </div>

      {text && (
        <div className="card space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900 text-sm">Plain Text</h3>
              <span className="text-xs text-gray-400">{tagCount} tags removed · {text.length} chars</span>
            </div>
            <ResultActions
              onDownload={handleDownload}
              downloadLabel="Download .txt"
              copyText={text}
            />
          </div>
          <textarea
            readOnly
            className="input resize-none font-mono text-sm bg-gray-50"
            rows={8}
            value={text}
          />
        </div>
      )}

      {!html && (
        <p className="text-xs text-gray-400 text-center py-2">Paste HTML above to extract plain text.</p>
      )}
    </ToolLayout>
  );
}
