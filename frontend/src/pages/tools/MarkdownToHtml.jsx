import { useState, useMemo } from 'react';
import ToolLayout from '../../components/common/ToolLayout';
import ResultActions from '../../components/common/ResultActions';
import { MarkdownToHtmlIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';

const seoContent = {
  about: 'The Tooli Markdown to HTML Converter transforms Markdown syntax into clean HTML markup in real time. See the rendered preview and copy the raw HTML for use in any web project. All conversion runs locally in your browser.',
  howTo: [
    'Type or paste Markdown into the editor on the left.',
    'The rendered HTML preview updates live on the right.',
    'Switch to the HTML tab to see the raw HTML output.',
    'Copy the HTML with the copy button.',
  ],
  features: [
    'Headings (H1–H6), bold, italic, strikethrough',
    'Ordered and unordered lists (nested supported)',
    'Inline code and fenced code blocks',
    'Blockquotes',
    'Horizontal rules',
    'Links and images',
  ],
  faq: [
    { q: 'Does this support GitHub Flavored Markdown?', a: 'The converter supports the most common GFM features: headings, bold, italic, strikethrough, lists, code blocks, blockquotes, links, images, and horizontal rules.' },
    { q: 'Can I use the output in any HTML page?', a: 'Yes. The output is standard HTML5. Paste it inside any element in your page.' },
    { q: 'Are HTML entities escaped?', a: 'Content inside code spans and fenced blocks is escaped (< → &lt; etc.) to prevent rendering as markup.' },
  ],
};

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function markdownToHtml(md) {
  const lines = md.split('\n');
  const out = [];
  let i = 0;

  const inlineFormat = (text) => {
    return text
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/~~([^~]+)~~/g, '<del>$1</del>')
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');
  };

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      out.push(`<pre><code${lang ? ` class="language-${lang}"` : ''}>${codeLines.join('\n')}</code></pre>`);
      i++;
      continue;
    }

    // Headings
    const hMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      out.push(`<h${level}>${inlineFormat(hMatch[2])}</h${level}>`);
      i++; continue;
    }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      out.push('<hr>');
      i++; continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const bqLines = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        bqLines.push(lines[i].slice(2));
        i++;
      }
      out.push(`<blockquote>${inlineFormat(bqLines.join(' '))}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        items.push(`<li>${inlineFormat(lines[i].replace(/^[-*+]\s/, ''))}</li>`);
        i++;
      }
      out.push(`<ul>${items.join('')}</ul>`);
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(`<li>${inlineFormat(lines[i].replace(/^\d+\.\s/, ''))}</li>`);
        i++;
      }
      out.push(`<ol>${items.join('')}</ol>`);
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      i++; continue;
    }

    // Paragraph
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' && !/^[#>*+\-`\d]/.test(lines[i])) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length) {
      out.push(`<p>${inlineFormat(paraLines.join(' '))}</p>`);
    } else {
      i++;
    }
  }

  return out.join('\n');
}

const SAMPLE = `# Hello, World!

Welcome to the **Markdown to HTML** converter. It supports *most* common Markdown features.

## Features

- Headings H1–H6
- **Bold** and *italic* text
- ~~Strikethrough~~
- \`inline code\`

## Ordered List

1. First item
2. Second item
3. Third item

## Code Block

\`\`\`js
const greeting = "Hello!";
console.log(greeting);
\`\`\`

> This is a blockquote. It supports **inline formatting** too.

---

[Visit Tooli](https://tooli.app)`;

export default function MarkdownToHtml() {
  const [md, setMd]     = useState('');
  const [view, setView] = useState('preview');

  useSEO({
    title: 'Markdown to HTML Converter',
    description: 'Convert Markdown to HTML with live preview. Supports headings, bold, italic, lists, code blocks, and more. Free, browser-based.',
    keywords: ['markdown to html', 'markdown converter', 'markdown preview', 'convert markdown online', 'md to html'],
    jsonLd: [
      buildToolSchema({ name: 'Markdown to HTML Converter', description: 'Convert Markdown syntax to HTML with live preview', url: '/tools/markdown-to-html' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/markdown-to-html',
  });

  const html = useMemo(() => md ? markdownToHtml(md) : '', [md]);

  return (
    <ToolLayout
      title="Markdown to HTML"
      description="Convert Markdown to HTML with a live preview. Supports all common Markdown syntax."
      icon={<MarkdownToHtmlIcon className="w-6 h-6" />}
      category="Text"
      seoContent={seoContent}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Editor */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <label className="label">Markdown</label>
            <button onClick={() => setMd(SAMPLE)} className="text-xs text-blue-600 hover:underline">Load sample</button>
          </div>
          <textarea
            className="input font-mono text-sm resize-none"
            rows={18}
            placeholder="# Hello World&#10;&#10;Type **Markdown** here…"
            value={md}
            onChange={e => setMd(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="card space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              {['preview', 'html'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-colors ${view === v ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}>
                  {v === 'preview' ? 'Preview' : 'HTML'}
                </button>
              ))}
            </div>
            {html && <ResultActions copyText={html} />}
          </div>

          {view === 'preview' ? (
            <div
              className="prose prose-sm max-w-none min-h-40 text-gray-800 overflow-auto"
              style={{ fontFamily: 'inherit' }}
              dangerouslySetInnerHTML={{ __html: html || '<p class="text-gray-300 text-sm">Preview will appear here…</p>' }}
            />
          ) : (
            <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-all min-h-40 overflow-auto bg-gray-50 rounded-lg p-3">
              {html || <span className="text-gray-300">HTML will appear here…</span>}
            </pre>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}
