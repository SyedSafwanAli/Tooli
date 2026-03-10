import { useState, useCallback } from 'react';
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

const MD_TOOLBAR = [
  { label: 'B',    title: 'Bold',        wrap: ['**', '**'],      block: false },
  { label: 'I',    title: 'Italic',      wrap: ['_', '_'],        block: false },
  { label: 'H2',   title: 'Heading 2',   prefix: '## ',           block: true  },
  { label: 'H3',   title: 'Heading 3',   prefix: '### ',          block: true  },
  { label: 'UL',   title: 'Bullet list', prefix: '- ',            block: true  },
  { label: 'OL',   title: 'Ordered list',prefix: '1. ',           block: true  },
  { label: '{ }',  title: 'Inline code', wrap: ['`', '`'],        block: false },
  { label: '```',  title: 'Code block',  wrap: ['```\n', '\n```'], block: false },
  { label: '"',    title: 'Blockquote',  prefix: '> ',            block: true  },
  { label: '—',    title: 'Horizontal rule', insert: '\n---\n',   block: false },
  { label: '🔗',   title: 'Link',        snippet: '[text](url)',  block: false },
  { label: '🖼',   title: 'Image',       snippet: '![alt](url)', block: false },
];

const HTML_TOOLBAR = [
  { label: '<p>',          title: 'Paragraph',     wrap: ['<p>', '</p>'],                         block: false },
  { label: '<h2>',         title: 'Heading 2',     wrap: ['<h2>', '</h2>'],                       block: false },
  { label: '<h3>',         title: 'Heading 3',     wrap: ['<h3>', '</h3>'],                       block: false },
  { label: '<strong>',     title: 'Bold',          wrap: ['<strong>', '</strong>'],               block: false },
  { label: '<em>',         title: 'Italic',        wrap: ['<em>', '</em>'],                       block: false },
  { label: '<a>',          title: 'Link',          snippet: '<a href="url">text</a>',             block: false },
  { label: '<img>',        title: 'Image',         snippet: '<img src="url" alt="description" />', block: false },
  { label: '<ul>',         title: 'Unordered list',snippet: '<ul>\n  <li>Item</li>\n  <li>Item</li>\n</ul>', block: false },
  { label: '<ol>',         title: 'Ordered list',  snippet: '<ol>\n  <li>Item</li>\n  <li>Item</li>\n</ol>', block: false },
  { label: '<blockquote>', title: 'Blockquote',    wrap: ['<blockquote>', '</blockquote>'],       block: false },
  { label: '<code>',       title: 'Inline code',   wrap: ['<code>', '</code>'],                   block: false },
  { label: '<pre>',        title: 'Code block',    wrap: ['<pre><code>', '</code></pre>'],        block: false },
  { label: '<div>',        title: 'Div',           wrap: ['<div>', '</div>'],                     block: false },
  { label: '<span>',       title: 'Span',          wrap: ['<span>', '</span>'],                   block: false },
  { label: '<hr>',         title: 'Horizontal rule',insert: '\n<hr />\n',                        block: false },
  { label: '<br>',         title: 'Line break',    insert: '<br />',                              block: false },
  { label: '<table>',      title: 'Table',
    snippet: '<table>\n  <thead>\n    <tr><th>Header</th><th>Header</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>Cell</td><td>Cell</td></tr>\n  </tbody>\n</table>',
    block: false },
];

/**
 * MarkdownEditor — split-pane editor with live preview.
 * Supports both Markdown and HTML editing modes.
 *
 * Props:
 *   value               string  — current content text
 *   onChange            (value: string) => void
 *   contentType         'markdown' | 'html'   (default: 'markdown')
 *   onContentTypeChange (type: string) => void — called when user switches mode
 *   placeholder         string
 *   minHeight           string (tailwind class, default 'min-h-[400px]')
 */
export default function MarkdownEditor({
  value = '',
  onChange,
  contentType = 'markdown',
  onContentTypeChange,
  placeholder,
  minHeight = 'min-h-[400px]',
}) {
  const [mode, setMode] = useState('split'); // 'edit' | 'split' | 'preview'

  const isHtml = contentType === 'html';
  const TOOLBAR = isHtml ? HTML_TOOLBAR : MD_TOOLBAR;
  const defaultPlaceholder = isHtml
    ? 'Write your content in HTML…'
    : 'Write your content in Markdown…';

  const applyFormat = useCallback((ta, item) => {
    if (!ta) return;
    const start = ta.selectionStart;
    const end   = ta.selectionEnd;
    const sel   = value.slice(start, end);
    let newVal;
    let cursor;

    if (item.insert) {
      newVal = value.slice(0, start) + item.insert + value.slice(end);
      cursor = start + item.insert.length;
    } else if (item.snippet) {
      newVal = value.slice(0, start) + item.snippet + value.slice(end);
      cursor = start + item.snippet.length;
    } else if (item.wrap) {
      const [pre, post] = item.wrap;
      newVal = value.slice(0, start) + pre + (sel || 'text') + post + value.slice(end);
      cursor = start + pre.length + (sel || 'text').length + post.length;
    } else if (item.prefix) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const lineEnd   = value.indexOf('\n', end);
      const lines     = value.slice(lineStart, lineEnd === -1 ? undefined : lineEnd).split('\n');
      const replaced  = lines.map(l => item.prefix + l).join('\n');
      newVal  = value.slice(0, lineStart) + replaced + (lineEnd === -1 ? '' : value.slice(lineEnd));
      cursor  = lineStart + replaced.length;
    }

    onChange(newVal);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(cursor, cursor);
    }, 0);
  }, [value, onChange]);

  const preview = isHtml ? (value || '') : marked.parse(value || '');

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-gray-50 border-b border-gray-200 flex-wrap">

        {/* Language toggle */}
        {onContentTypeChange && (
          <>
            <div className="flex items-center bg-gray-200 rounded-lg p-0.5 text-xs gap-0.5 mr-1">
              {['markdown', 'html'].map(ct => (
                <button
                  key={ct}
                  type="button"
                  onClick={() => onContentTypeChange(ct)}
                  className={`px-2.5 py-1 rounded-md font-semibold uppercase tracking-wide transition-colors ${
                    contentType === ct
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {ct === 'markdown' ? 'MD' : 'HTML'}
                </button>
              ))}
            </div>
            <span className="w-px h-4 bg-gray-300 mr-1" />
          </>
        )}

        {/* Format buttons */}
        {TOOLBAR.map((item) => (
          <button
            key={item.label}
            type="button"
            title={item.title}
            onClick={e => {
              e.preventDefault();
              const ta = document.querySelector('[data-md-editor]');
              applyFormat(ta, item);
            }}
            className="px-2 py-1 text-xs font-mono font-semibold text-gray-600 hover:bg-gray-200 hover:text-gray-900 rounded transition-colors"
          >
            {item.label}
          </button>
        ))}

        <div className="flex-1" />

        {/* View mode toggle */}
        <div className="flex items-center bg-gray-200 rounded-lg p-0.5 text-xs gap-0.5">
          {['edit', 'split', 'preview'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors ${
                mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Panes */}
      <div className={`flex ${minHeight}`}>
        {/* Edit pane */}
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            data-md-editor
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || defaultPlaceholder}
            className={`flex-1 p-4 text-sm font-mono text-gray-800 resize-none outline-none bg-white ${
              mode === 'split' ? 'border-r border-gray-200' : ''
            }`}
            spellCheck={false}
          />
        )}

        {/* Preview pane */}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className="flex-1 p-4 overflow-y-auto prose prose-sm max-w-none text-gray-800"
            dangerouslySetInnerHTML={{
              __html: preview || '<p class="text-gray-400 italic">Nothing to preview yet…</p>',
            }}
          />
        )}
      </div>

      {/* Footer: word count + mode indicator */}
      <div className="px-3 py-1.5 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex items-center justify-between">
        <span className={`px-1.5 py-0.5 rounded font-semibold ${isHtml ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'}`}>
          {isHtml ? 'HTML' : 'Markdown'}
        </span>
        <span>{value.split(/\s+/).filter(Boolean).length} words · {value.length} chars</span>
      </div>
    </div>
  );
}
