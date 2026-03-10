import { useState, useCallback, useRef, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { marked } from 'marked';
import JSZip from 'jszip';
import ToolLayout from '../../components/common/ToolLayout';
import { MarkdownPdfIcon } from '../../components/common/Icons';
import { useSEO, buildToolSchema, buildFAQSchema } from '../../utils/useSEO';
import api from '../../services/api';

// ─── marked config ────────────────────────────────────────────────────────────
marked.setOptions({ breaks: true, gfm: true });

// ─── SEO ─────────────────────────────────────────────────────────────────────
const seoContent = {
  about: [
    'The Tooli Markdown ↔ PDF Converter lets you convert Markdown documents to styled PDFs and extract PDF text back into clean Markdown — completely free, with no file storage.',
    'Use the built-in editor with live preview and formatting toolbar. Customise page size, orientation, fonts, margins, and light/dark theme before exporting. Batch-convert multiple .md files at once.',
  ],
  howTo: [
    'Choose the direction: "Markdown → PDF" or "PDF → Markdown".',
    'Type or paste Markdown in the editor, or drag and drop .md files for batch conversion.',
    'Adjust export settings (page size, font, theme, margins) using the settings bar.',
    'Click "Convert to PDF" to generate your PDF, then download individually or as a ZIP.',
  ],
  features: [
    'Live Markdown preview with Editor, Split, and Preview modes',
    'Formatting toolbar: Bold, Italic, Headings, Lists, Code, Tables, Links, Blockquotes',
    'Export to A4, Letter, Legal, or A5 — portrait or landscape',
    'Light and Dark PDF themes; Serif, Sans-serif, and Monospace fonts',
    'Batch multi-file conversion with per-file status and ZIP download',
    'PDF → Markdown extraction preserving headings, lists, and paragraphs',
  ],
  faq: [
    { q: 'Does this tool store my files?', a: 'No. Files are processed in memory and deleted immediately after conversion. Nothing is stored on the server.' },
    { q: 'How accurate is PDF → Markdown extraction?', a: 'Quality depends on the PDF. Text-based PDFs extract well. Scanned image PDFs cannot be read as text.' },
    { q: 'Can I convert multiple files at once?', a: 'Yes. Upload multiple .md files for batch conversion. Download as individual PDFs or a single ZIP.' },
  ],
};

// ─── Toolbar buttons ──────────────────────────────────────────────────────────
const TOOLBAR_GROUPS = [
  [
    { label: 'B',    title: 'Bold',          wrap: ['**', '**'],          ph: 'bold text' },
    { label: 'I',    title: 'Italic',         wrap: ['_', '_'],            ph: 'italic text' },
    { label: 'H1',   title: 'Heading 1',      line: '# ',                  ph: 'Heading 1' },
    { label: 'H2',   title: 'Heading 2',      line: '## ',                 ph: 'Heading 2' },
    { label: 'H3',   title: 'Heading 3',      line: '### ',                ph: 'Heading 3' },
  ],
  [
    { label: 'UL',   title: 'Bullet list',    line: '- ',                  ph: 'list item' },
    { label: 'OL',   title: 'Numbered list',  line: '1. ',                 ph: 'list item' },
    { label: '☑',   title: 'Task',           line: '- [ ] ',              ph: 'task' },
  ],
  [
    { label: '</>',  title: 'Inline code',    wrap: ['`', '`'],            ph: 'code' },
    { label: '```',  title: 'Code block',     block: '```\n',  blockEnd: '\n```', ph: 'code' },
    { label: '"',    title: 'Blockquote',     line: '> ',                  ph: 'quote' },
    { label: '⊞',   title: 'Table',          insert: '| Col 1 | Col 2 | Col 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n' },
  ],
  [
    { label: '🔗',  title: 'Link',           wrap: ['[', '](url)'],       ph: 'link text' },
    { label: '🖼',  title: 'Image',          wrap: ['![', '](url)'],      ph: 'alt text' },
    { label: '—',   title: 'Divider',        insert: '\n---\n' },
  ],
];

function applyToolbar(el, btn) {
  const start = el.selectionStart;
  const end   = el.selectionEnd;
  const val   = el.value;
  const sel   = val.slice(start, end) || btn.ph || '';
  let newVal, cursor;

  if (btn.insert) {
    newVal = val.slice(0, start) + btn.insert + val.slice(end);
    cursor = start + btn.insert.length;
  } else if (btn.block) {
    const ins = btn.block + sel + btn.blockEnd;
    newVal = val.slice(0, start) + ins + val.slice(end);
    cursor = start + ins.length;
  } else if (btn.line) {
    const ls = val.lastIndexOf('\n', start - 1) + 1;
    const ins = btn.line + sel;
    newVal = val.slice(0, ls) + ins + val.slice(end);
    cursor = ls + ins.length;
  } else {
    const [pre, post] = btn.wrap;
    const ins = pre + sel + post;
    newVal = val.slice(0, start) + ins + val.slice(end);
    cursor = start + ins.length;
  }
  return { newVal, cursor };
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  pageSize: 'A4', orientation: 'portrait', theme: 'light',
  font: 'sans-serif', fontSize: 14, marginTop: 20, marginBottom: 20, marginLeft: 15, marginRight: 15,
};

const STARTER_MD = `# My Document

Write your **Markdown** here and see a live preview on the right.

## Features

- Bold, *italic*, \`inline code\`
- Numbered lists, task lists
- Tables and blockquotes

## Example Table

| Name  | Role    | Status |
| ----- | ------- | ------ |
| Alice | Admin   | Active |
| Bob   | Editor  | Away   |

> Use the toolbar above to insert formatting quickly.

\`\`\`js
console.log("Hello, PDF!");
\`\`\`
`;

function fmtSize(b) {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MarkdownPDFConverter() {
  const [mode, setMode]         = useState('md-to-pdf');
  const [viewMode, setViewMode] = useState('split');
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS });
  const [showSettings, setShowSettings] = useState(false);

  // MD→PDF
  const [editorContent, setEditorContent] = useState(STARTER_MD);
  const [batchFiles, setBatchFiles]   = useState([]);
  const [activeBatch, setActiveBatch] = useState(null);
  const [converting, setConverting]   = useState(false);
  const [singleBlob, setSingleBlob]   = useState(null);
  const [singleSize, setSingleSize]   = useState(0);
  const textareaRef = useRef(null);

  // PDF→MD
  const [pdfFiles, setPdfFiles]   = useState([]);
  const [activePdf, setActivePdf] = useState(null);

  useSEO({
    title: 'Markdown ↔ PDF Converter',
    description: 'Convert Markdown to styled PDF and extract PDF text as Markdown. Free, live preview, batch support.',
    keywords: ['markdown to pdf', 'pdf to markdown', 'md to pdf online', 'convert markdown pdf'],
    jsonLd: [
      buildToolSchema({ name: 'Markdown ↔ PDF Converter', description: 'Convert Markdown to PDF online', url: '/tools/markdown-pdf' }),
      buildFAQSchema(seoContent.faq),
    ],
    canonical: '/tools/markdown-pdf',
  });

  // Live preview HTML
  const previewHtml = useMemo(() => {
    try { return marked.parse(editorContent); } catch { return ''; }
  }, [editorContent]);

  // ── Dropzones ─────────────────────────────────────────────────────────────
  const onDropMd = useCallback((accepted) => {
    accepted.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const id = crypto.randomUUID();
        setBatchFiles(prev => [...prev, { id, name: file.name, content: e.target.result, status: 'ready', blob: null, size: 0, error: '' }]);
        setActiveBatch(id);
        setEditorContent(e.target.result);
        setSingleBlob(null);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps: getMdRoot, getInputProps: getMdInput, isDragActive: isMdDrag } = useDropzone({
    onDrop: onDropMd, accept: { 'text/markdown': ['.md', '.markdown'], 'text/plain': ['.txt'] }, multiple: true,
  });

  const onDropPdf = useCallback((accepted) => {
    const items = accepted.map(file => ({
      id: crypto.randomUUID(), file, name: file.name, status: 'ready', markdown: '', pageCount: 0, wordCount: 0, error: '', edited: false,
    }));
    setPdfFiles(prev => {
      const next = [...prev, ...items];
      if (!activePdf && items.length) setActivePdf(items[0].id);
      return next;
    });
  }, [activePdf]);

  const { getRootProps: getPdfRoot, getInputProps: getPdfInput, isDragActive: isPdfDrag } = useDropzone({
    onDrop: onDropPdf, accept: { 'application/pdf': ['.pdf'] }, multiple: true,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const activePdfItem = pdfFiles.find(f => f.id === activePdf) ?? null;

  function updatePdfItem(id, patch) {
    setPdfFiles(prev => prev.map(f => f.id === id ? { ...f, ...patch } : f));
  }

  function setSetting(k, v) {
    setSettings(p => ({ ...p, [k]: v }));
    setSingleBlob(null);
  }

  function handleToolbar(btn) {
    const ta = textareaRef.current;
    if (!ta) return;
    const r = applyToolbar(ta, btn);
    if (!r) return;
    setEditorContent(r.newVal);
    setSingleBlob(null);
    if (activeBatch) setBatchFiles(p => p.map(f => f.id === activeBatch ? { ...f, content: r.newVal, status: 'ready', blob: null } : f));
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(r.cursor, r.cursor); });
  }

  function onEditorChange(e) {
    setEditorContent(e.target.value);
    setSingleBlob(null);
    if (activeBatch) setBatchFiles(p => p.map(f => f.id === activeBatch ? { ...f, content: e.target.value, status: 'ready', blob: null } : f));
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  // ── Convert single ────────────────────────────────────────────────────────
  async function convertSingle() {
    setConverting(true); setSingleBlob(null);
    try {
      const content = activeBatch ? (batchFiles.find(f => f.id === activeBatch)?.content ?? editorContent) : editorContent;
      const fd = new FormData();
      fd.append('markdown', content);
      Object.entries(settings).forEach(([k, v]) => fd.append(k, v));
      const res = await api.post('/tools/markdown-to-pdf', fd, { responseType: 'blob' });
      setSingleBlob(res.data); setSingleSize(res.data.size);
      if (activeBatch) setBatchFiles(p => p.map(f => f.id === activeBatch ? { ...f, blob: res.data, size: res.data.size, status: 'done' } : f));
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Conversion failed.');
    } finally { setConverting(false); }
  }

  async function convertAll() {
    setConverting(true);
    for (const item of batchFiles) {
      if (item.status === 'done') continue;
      setBatchFiles(p => p.map(f => f.id === item.id ? { ...f, status: 'processing' } : f));
      try {
        const fd = new FormData();
        fd.append('markdown', item.content);
        Object.entries(settings).forEach(([k, v]) => fd.append(k, v));
        const res = await api.post('/tools/markdown-to-pdf', fd, { responseType: 'blob' });
        setBatchFiles(p => p.map(f => f.id === item.id ? { ...f, blob: res.data, size: res.data.size, status: 'done', error: '' } : f));
      } catch (err) {
        setBatchFiles(p => p.map(f => f.id === item.id ? { ...f, status: 'error', error: err?.message || 'Failed' } : f));
      }
    }
    setConverting(false);
  }

  async function downloadZip() {
    const zip = new JSZip();
    batchFiles.filter(f => f.blob).forEach(f => zip.file(f.name.replace(/\.md$/i, '.pdf'), f.blob));
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'converted.zip');
  }

  async function extractMarkdown(item) {
    updatePdfItem(item.id, { status: 'processing', error: '' });
    try {
      const fd = new FormData();
      fd.append('pdf', item.file);
      const res = await api.post('/tools/pdf-to-markdown', fd);
      updatePdfItem(item.id, { status: 'done', markdown: res.data.data.markdown, pageCount: res.data.data.pageCount, wordCount: res.data.data.wordCount });
    } catch (err) {
      updatePdfItem(item.id, { status: 'error', error: err?.message || 'Extraction failed.' });
    }
  }

  async function extractAll() {
    for (const item of pdfFiles) if (item.status !== 'done') await extractMarkdown(item);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <ToolLayout
      title="Markdown ↔ PDF Converter"
      description="Convert Markdown to styled PDF and extract PDF text as Markdown — free, live preview, batch support."
      icon={<MarkdownPdfIcon className="w-6 h-6" />}
      category="PDF"
      seoContent={seoContent}
    >
      {/* ── Mode tabs ──────────────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {[{ id: 'md-to-pdf', label: 'Markdown → PDF' }, { id: 'pdf-to-md', label: 'PDF → Markdown' }].map(t => (
          <button
            key={t.id}
            onClick={() => setMode(t.id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all
              ${mode === t.id ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >{t.label}</button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          MARKDOWN → PDF
      ══════════════════════════════════════════════════════════════════════ */}
      {mode === 'md-to-pdf' && (
        <div className="space-y-3">

          {/* Batch upload strip */}
          <div
            {...getMdRoot()}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-sm
              ${isMdDrag ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'}`}
          >
            <input {...getMdInput()} />
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-gray-400 text-xs">
              {isMdDrag ? 'Drop .md files here…' : 'Drop .md files to batch-convert, or type below'}
            </span>
            {batchFiles.length > 0 && (
              <span className="ml-auto text-xs text-blue-600 font-semibold">{batchFiles.length} file{batchFiles.length > 1 ? 's' : ''}</span>
            )}
          </div>

          {/* Batch pills */}
          {batchFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              {batchFiles.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setActiveBatch(f.id); setEditorContent(f.content); setSingleBlob(null); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                    ${activeBatch === f.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    f.status === 'done' ? 'bg-green-500' : f.status === 'processing' ? 'bg-blue-500 animate-pulse' : f.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  {f.name}
                  {f.blob && (
                    <span className="text-green-600 hover:text-green-800" title="Download"
                      onClick={e => { e.stopPropagation(); downloadBlob(f.blob, f.name.replace(/\.md$/i, '.pdf')); }}>↓</span>
                  )}
                  <span className="text-gray-300 hover:text-red-400 ml-0.5"
                    onClick={e => { e.stopPropagation(); setBatchFiles(p => p.filter(x => x.id !== f.id)); if (activeBatch === f.id) { setActiveBatch(null); setSingleBlob(null); } }}>×</span>
                </button>
              ))}
              <button onClick={convertAll} disabled={converting}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40">
                {converting ? 'Converting…' : 'Convert All'}
              </button>
              <button onClick={downloadZip} disabled={!batchFiles.some(f => f.blob)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:border-blue-300 disabled:opacity-40">
                ⬇ ZIP all
              </button>
            </div>
          )}

          {/* ── Editor card ─────────────────────────────────────────────────── */}
          <div className="card !p-0 overflow-hidden border border-gray-200">

            {/* Toolbar row */}
            <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50">
              {TOOLBAR_GROUPS.map((group, gi) => (
                <span key={gi} className="flex items-center gap-0.5">
                  {gi > 0 && <span className="w-px h-5 bg-gray-200 mx-1" />}
                  {group.map((btn, bi) => (
                    <button
                      key={bi}
                      title={btn.title}
                      onClick={() => handleToolbar(btn)}
                      className="px-2 py-1 rounded text-xs font-mono font-bold text-gray-500 hover:bg-white hover:text-blue-600 hover:shadow-sm transition-all"
                    >{btn.label}</button>
                  ))}
                </span>
              ))}
              {/* Spacer */}
              <div className="flex-1" />
              {/* View mode */}
              <div className="flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-0.5">
                {[
                  { v: 'editor',  icon: '▤', label: 'Editor' },
                  { v: 'split',   icon: '▧', label: 'Split' },
                  { v: 'preview', icon: '▣', label: 'Preview' },
                ].map(({ v, icon, label }) => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    title={label}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-all
                      ${viewMode === v ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-700'}`}
                  >{icon} {label}</button>
                ))}
              </div>
              {/* Settings toggle */}
              <button
                onClick={() => setShowSettings(p => !p)}
                className={`ml-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all
                  ${showSettings ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-500 hover:border-blue-300 bg-white'}`}
              >⚙ Settings</button>
            </div>

            {/* Editor / Preview area */}
            <div className={`grid ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`} style={{ height: 520 }}>
              {/* Editor pane */}
              {viewMode !== 'preview' && (
                <textarea
                  ref={textareaRef}
                  value={editorContent}
                  onChange={onEditorChange}
                  className="w-full h-full resize-none font-mono text-sm leading-relaxed p-5 focus:outline-none bg-white text-gray-800 border-0"
                  style={{ borderRight: viewMode === 'split' ? '1px solid #f0f0f0' : 'none' }}
                  spellCheck={false}
                  placeholder="Type or paste your Markdown here…"
                />
              )}
              {/* Preview pane */}
              {viewMode !== 'editor' && (
                <div
                  className="h-full overflow-auto p-5 bg-white"
                  style={{
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: '#1a1a1a',
                  }}
                >
                  <div
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── Settings panel (collapsible) ─────────────────────────────────── */}
          {showSettings && (
            <div className="card border border-blue-100 bg-blue-50/30 space-y-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Export Settings</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">

                {/* Page size */}
                <div>
                  <label className="label">Page Size</label>
                  <select className="input" value={settings.pageSize} onChange={e => setSetting('pageSize', e.target.value)}>
                    <option value="A4">A4</option>
                    <option value="Letter">Letter</option>
                    <option value="Legal">Legal</option>
                    <option value="A3">A3</option>
                    <option value="A5">A5</option>
                  </select>
                </div>

                {/* Orientation */}
                <div>
                  <label className="label">Orientation</label>
                  <div className="flex gap-1.5 mt-1">
                    {['portrait', 'landscape'].map(o => (
                      <button key={o} onClick={() => setSetting('orientation', o)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold capitalize transition-all
                          ${settings.orientation === o ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300 bg-white'}`}
                      >{o === 'portrait' ? '↕' : '↔'} {o}</button>
                    ))}
                  </div>
                </div>

                {/* Theme */}
                <div>
                  <label className="label">Theme</label>
                  <div className="flex gap-1.5 mt-1">
                    {[{ v: 'light', l: '☀ Light' }, { v: 'dark', l: '🌙 Dark' }].map(({ v, l }) => (
                      <button key={v} onClick={() => setSetting('theme', v)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all
                          ${settings.theme === v
                            ? v === 'dark' ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-blue-500 text-blue-700 shadow'
                            : 'border-gray-200 text-gray-600 hover:border-blue-300 bg-white'}`}
                      >{l}</button>
                    ))}
                  </div>
                </div>

                {/* Font */}
                <div>
                  <label className="label">Font</label>
                  <select className="input" value={settings.font} onChange={e => setSetting('font', e.target.value)}>
                    <option value="sans-serif">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>

                {/* Font size */}
                <div>
                  <label className="label">Font Size: <span className="text-blue-600 font-bold">{settings.fontSize}px</span></label>
                  <input type="range" min={10} max={22} value={settings.fontSize}
                    onChange={e => setSetting('fontSize', +e.target.value)}
                    className="w-full accent-blue-600 mt-2" />
                </div>

                {/* Margins */}
                <div>
                  <label className="label">Margins (mm)</label>
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    {[['marginTop', 'T'], ['marginBottom', 'B'], ['marginLeft', 'L'], ['marginRight', 'R']].map(([k, lbl]) => (
                      <div key={k} className="flex items-center gap-1">
                        <span className="text-[10px] text-gray-400 w-3 shrink-0">{lbl}</span>
                        <input type="number" min={0} max={50} value={settings[k]}
                          onChange={e => setSetting(k, +e.target.value)}
                          className="input !py-0.5 !px-1.5 text-xs w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Convert + Result bar ──────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <button
              onClick={convertSingle}
              disabled={converting || !editorContent.trim()}
              className="btn btn-primary px-8 py-3 text-sm font-bold disabled:opacity-40 flex items-center gap-2"
            >
              {converting
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Converting…</>
                : '⬇ Convert to PDF'}
            </button>

            {singleBlob && (
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-green-50 border border-green-200">
                <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-green-700">PDF ready · {fmtSize(singleSize)}</span>
                <button
                  onClick={() => downloadBlob(singleBlob, activeBatch ? (batchFiles.find(f => f.id === activeBatch)?.name?.replace(/\.md$/i, '') ?? 'document') + '.pdf' : 'converted.pdf')}
                  className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700"
                >Download</button>
              </div>
            )}

            {!singleBlob && (
              <p className="text-xs text-gray-400">
                {settings.pageSize} · {settings.orientation} · {settings.theme} theme · {settings.font}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          PDF → MARKDOWN
      ══════════════════════════════════════════════════════════════════════ */}
      {mode === 'pdf-to-md' && (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            {...getPdfRoot()}
            className={`card flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed cursor-pointer transition-colors
              ${isPdfDrag ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'}`}
          >
            <input {...getPdfInput()} />
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            {isPdfDrag
              ? <p className="text-red-500 font-semibold text-sm">Drop PDF files here…</p>
              : <><p className="text-gray-600 font-semibold text-sm">Click or drag PDF files here</p><p className="text-gray-400 text-xs">Supports text-based PDFs · up to 10 MB each</p></>
            }
          </div>

          {/* File pills + batch extract */}
          {pdfFiles.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {pdfFiles.map(f => (
                <button key={f.id} onClick={() => setActivePdf(f.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                    ${activePdf === f.id ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-600 hover:border-red-300'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    f.status === 'done' ? 'bg-green-500' : f.status === 'processing' ? 'bg-blue-500 animate-pulse' : f.status === 'error' ? 'bg-red-500' : 'bg-gray-300'
                  }`} />
                  {f.name}
                  <span className="text-gray-300 hover:text-red-400"
                    onClick={e => { e.stopPropagation(); setPdfFiles(p => p.filter(x => x.id !== f.id)); if (activePdf === f.id) setActivePdf(null); }}>×</span>
                </button>
              ))}
              <button onClick={extractAll}
                disabled={pdfFiles.every(f => f.status === 'done' || f.status === 'processing')}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-40">
                Extract All
              </button>
            </div>
          )}

          {/* Active PDF result */}
          {activePdfItem && (
            <div className="card !p-0 overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-700 truncate">{activePdfItem.name}</span>
                {activePdfItem.status === 'done' && (
                  <span className="text-xs text-gray-400 shrink-0">{activePdfItem.pageCount}p · {activePdfItem.wordCount} words</span>
                )}
                <div className="ml-auto flex items-center gap-2">
                  {activePdfItem.status === 'done' && (
                    <>
                      <button
                        onClick={() => navigator.clipboard.writeText(activePdfItem.markdown)}
                        className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-white bg-transparent"
                      >📋 Copy</button>
                      <button
                        onClick={() => {
                          const blob = new Blob([activePdfItem.markdown], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url; a.download = activePdfItem.name.replace('.pdf', '.md');
                          document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
                        }}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700"
                      >⬇ Download .md</button>
                    </>
                  )}
                  <button
                    onClick={() => extractMarkdown(activePdfItem)}
                    disabled={activePdfItem.status === 'processing'}
                    className="px-3 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-white bg-transparent disabled:opacity-40"
                  >{activePdfItem.status === 'processing' ? '…' : activePdfItem.status === 'done' ? '↺ Re-extract' : 'Extract'}</button>
                </div>
              </div>

              {/* Content */}
              {activePdfItem.status === 'ready' && (
                <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-400">
                  <svg className="w-12 h-12 text-gray-200" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="text-sm">Click <strong>Extract</strong> to convert this PDF to Markdown</p>
                </div>
              )}
              {activePdfItem.status === 'processing' && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-blue-500">
                  <span className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-medium">Extracting text…</p>
                </div>
              )}
              {activePdfItem.status === 'error' && (
                <div className="p-5 bg-red-50 text-red-700 text-sm">{activePdfItem.error}</div>
              )}
              {activePdfItem.status === 'done' && (
                <textarea
                  value={activePdfItem.markdown}
                  onChange={e => updatePdfItem(activePdfItem.id, { markdown: e.target.value, edited: true })}
                  className="w-full resize-none font-mono text-sm leading-relaxed p-5 focus:outline-none bg-white text-gray-800 border-0"
                  style={{ height: 480 }}
                  spellCheck={false}
                />
              )}
            </div>
          )}

          {/* Note */}
          {pdfFiles.length > 0 && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5">
              ⚠ <strong>Extraction quality</strong> depends on the PDF. Text-based PDFs work well. Scanned or image-only PDFs cannot be extracted. You can edit the output before downloading.
            </p>
          )}
        </div>
      )}
    </ToolLayout>
  );
}
