const MarkdownIt = require('markdown-it');
const puppeteer  = require('puppeteer');
const pdfParse   = require('pdf-parse');
const fs         = require('fs').promises;
const { recordToolUse } = require('../../repositories/analyticsRepository');

// ─── Markdown renderer ───────────────────────────────────────────────────────
const md = new MarkdownIt({
  html:        true,
  linkify:     true,
  typographer: true,
  breaks:      false,
});

// ─── Theme tokens ────────────────────────────────────────────────────────────
const THEMES = {
  light: { bg: '#ffffff', text: '#1a1a1a', muted: '#6b7280', code: '#f3f4f6', border: '#e5e7eb', link: '#2563eb', blockquoteBg: '#f9fafb' },
  dark:  { bg: '#1e1e2e', text: '#cdd6f4', muted: '#a6adc8', code: '#313244', border: '#45475a', link: '#89b4fa', blockquoteBg: '#181825' },
};

const FONTS = {
  'sans-serif': '"Helvetica Neue", Arial, "Noto Sans", sans-serif',
  'serif':      '"Georgia", "Times New Roman", Times, serif',
  'monospace':  '"Courier New", Courier, monospace',
};

// ─── HTML template ───────────────────────────────────────────────────────────
function buildHTML(markdownContent, options = {}) {
  const {
    theme      = 'light',
    font       = 'sans-serif',
    fontSize   = 14,
    lineHeight = 1.7,
  } = options;

  const c = THEMES[theme] || THEMES.light;
  const f = FONTS[font]   || FONTS['sans-serif'];
  const body = md.render(markdownContent);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: ${f};
    font-size: ${fontSize}px;
    line-height: ${lineHeight};
    color: ${c.text};
    background: ${c.bg};
    padding: 0;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.25;
    margin: 1.5em 0 0.5em;
    color: ${c.text};
  }
  h1 { font-size: 2em;    border-bottom: 2px solid ${c.border}; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em;  border-bottom: 1px solid ${c.border}; padding-bottom: 0.2em; }
  h3 { font-size: 1.25em; }
  h4 { font-size: 1.1em; }
  h5, h6 { font-size: 1em; color: ${c.muted}; }

  p { margin: 0.8em 0; }

  a { color: ${c.link}; text-decoration: underline; }

  ul, ol { margin: 0.8em 0; padding-left: 2em; }
  li { margin: 0.25em 0; }
  li > ul, li > ol { margin: 0.25em 0; }

  /* Checkboxes (GFM task lists) */
  input[type="checkbox"] { margin-right: 0.4em; vertical-align: middle; }

  code {
    font-family: "Courier New", Courier, monospace;
    font-size: 0.875em;
    background: ${c.code};
    border: 1px solid ${c.border};
    border-radius: 4px;
    padding: 0.1em 0.4em;
  }

  pre {
    background: ${c.code};
    border: 1px solid ${c.border};
    border-radius: 6px;
    padding: 1em 1.2em;
    margin: 1em 0;
    overflow-x: auto;
  }
  pre code {
    background: none;
    border: none;
    padding: 0;
    font-size: 0.9em;
  }

  blockquote {
    border-left: 4px solid ${c.border};
    background: ${c.blockquoteBg};
    padding: 0.6em 1em;
    margin: 1em 0;
    border-radius: 0 4px 4px 0;
    color: ${c.muted};
  }
  blockquote p { margin: 0; }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    font-size: 0.95em;
  }
  th, td {
    border: 1px solid ${c.border};
    padding: 0.45em 0.8em;
    text-align: left;
    vertical-align: top;
  }
  th { background: ${c.code}; font-weight: 600; }
  tr:nth-child(even) td { background: ${c.blockquoteBg}; }

  img { max-width: 100%; height: auto; display: block; margin: 0.5em 0; }

  hr { border: none; border-top: 2px solid ${c.border}; margin: 1.5em 0; }

  /* Syntax hint classes (no highlighter, but at least readable) */
  .hljs { background: ${c.code}; border-radius: 4px; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

// ─── Markdown → PDF ──────────────────────────────────────────────────────────
async function markdownToPDF(content, options = {}) {
  await recordToolUse('markdown-pdf').catch(() => {});

  const {
    pageSize    = 'A4',
    orientation = 'portrait',
    marginTop    = 20,
    marginBottom = 20,
    marginLeft   = 15,
    marginRight  = 15,
  } = options;

  const html = buildHTML(content, options);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format:    pageSize !== 'Custom' ? pageSize : undefined,
      landscape: orientation === 'landscape',
      margin: {
        top:    `${marginTop}mm`,
        bottom: `${marginBottom}mm`,
        left:   `${marginLeft}mm`,
        right:  `${marginRight}mm`,
      },
      printBackground: true,
    });

    return { buffer: Buffer.from(pdfBuffer), size: pdfBuffer.byteLength };
  } finally {
    await browser.close();
  }
}

// ─── PDF → Markdown ──────────────────────────────────────────────────────────
async function pdfToMarkdown(filePath) {
  await recordToolUse('pdf-markdown').catch(() => {});

  const fileBuffer = await fs.readFile(filePath);
  const data = await pdfParse(fileBuffer);

  const markdown = textToMarkdown(data.text);

  return {
    markdown,
    pageCount: data.numpages,
    wordCount: markdown.split(/\s+/).filter(Boolean).length,
  };
}

// ─── Text → Markdown heuristics ──────────────────────────────────────────────
function textToMarkdown(raw) {
  if (!raw) return '';

  const lines = raw.split('\n');
  const out   = [];

  for (let i = 0; i < lines.length; i++) {
    const line    = lines[i];
    const trimmed = line.trim();

    // Blank line
    if (!trimmed) {
      out.push('');
      continue;
    }

    // Numbered list  "1. " / "1) "
    if (/^\d+[.)]\s+/.test(trimmed)) {
      out.push(trimmed);
      continue;
    }

    // Bullet list (common PDF bullet chars)
    if (/^[•·▪▸►‣–\-\*]\s+/.test(trimmed)) {
      out.push('- ' + trimmed.replace(/^[•·▪▸►‣–\-\*]\s+/, ''));
      continue;
    }

    // Looks like a heading: short, no period at end, possibly ALL CAPS
    const isShort  = trimmed.length < 80;
    const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
    const noPunct  = !/[.,:;?!]$/.test(trimmed);
    const nextBlank = !lines[i + 1]?.trim();

    if (isShort && noPunct && nextBlank && isAllCaps && trimmed.length > 2) {
      out.push(`# ${trimmed}`);
      continue;
    }

    if (isShort && noPunct && nextBlank && trimmed.length > 2 && trimmed.length < 50) {
      // Possible sub-heading — use h2
      const prevBlank = !lines[i - 1]?.trim();
      if (prevBlank) {
        out.push(`## ${trimmed}`);
        continue;
      }
    }

    // Code-like line: starts with 4+ spaces or tab
    if (/^(\t| {4})/.test(line)) {
      out.push('    ' + trimmed);
      continue;
    }

    // Regular paragraph text
    out.push(trimmed);
  }

  // Merge consecutive text lines into paragraphs, separated by blank lines
  const merged = [];
  let para = [];

  for (const line of out) {
    const isSpecial = line === '' || line.startsWith('#') || /^(\d+[.)]|\-)\s/.test(line) || line.startsWith('    ');

    if (isSpecial) {
      if (para.length) {
        merged.push(para.join(' '));
        para = [];
      }
      merged.push(line);
    } else {
      para.push(line);
    }
  }
  if (para.length) merged.push(para.join(' '));

  return merged.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ─── Render markdown → HTML (for preview endpoint) ───────────────────────────
function renderMarkdownHTML(content, options = {}) {
  return buildHTML(content, options);
}

module.exports = { markdownToPDF, pdfToMarkdown, renderMarkdownHTML };
