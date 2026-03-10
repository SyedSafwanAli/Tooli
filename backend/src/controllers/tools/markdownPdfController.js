const fs = require('fs').promises;
const markdownPdfService = require('../../services/tools/markdownPdfService');
const { cleanupFile }    = require('../../services/tools/imageService');
const { badRequest }     = require('../../utils/responseHelper');

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseOptions(body) {
  return {
    pageSize:    body.pageSize    || 'A4',
    orientation: body.orientation || 'portrait',
    theme:       body.theme       || 'light',
    font:        body.font        || 'sans-serif',
    fontSize:    parseInt(body.fontSize    || 14,  10),
    lineHeight:  parseFloat(body.lineHeight || 1.7),
    marginTop:    parseInt(body.marginTop    || 20,  10),
    marginBottom: parseInt(body.marginBottom || 20,  10),
    marginLeft:   parseInt(body.marginLeft   || 15,  10),
    marginRight:  parseInt(body.marginRight  || 15,  10),
  };
}

// ─── POST /tools/markdown-to-pdf ─────────────────────────────────────────────
// Body: { markdown: string } OR uploaded .md file
// Response: application/pdf binary
async function markdownToPDF(req, res, next) {
  let filePath = null;
  try {
    let content = req.body?.markdown || '';

    // If a .md file was uploaded, read it instead
    if (req.file) {
      filePath = req.file.path;
      content  = await fs.readFile(filePath, 'utf-8');
    }

    if (!content.trim()) {
      return badRequest(res, 'No Markdown content provided.');
    }

    const options = parseOptions(req.body || {});
    const result  = await markdownPdfService.markdownToPDF(content, options);

    res.set({
      'Content-Type':        'application/pdf',
      'Content-Disposition': 'attachment; filename="converted.pdf"',
      'Content-Length':      result.buffer.length,
      'x-output-size':       result.buffer.length,
    });
    res.send(result.buffer);
  } catch (err) {
    next(err);
  } finally {
    if (filePath) await cleanupFile(filePath).catch(() => {});
  }
}

// ─── POST /tools/pdf-to-markdown ─────────────────────────────────────────────
// Body: multipart/form-data with field "pdf"
// Response: JSON { success, data: { markdown, pageCount, wordCount } }
async function pdfToMarkdown(req, res, next) {
  try {
    if (!req.file) {
      return badRequest(res, 'No PDF file uploaded.');
    }

    const result = await markdownPdfService.pdfToMarkdown(req.file.path);

    res.json({
      success: true,
      data: {
        markdown:  result.markdown,
        pageCount: result.pageCount,
        wordCount: result.wordCount,
      },
    });
  } catch (err) {
    next(err);
  } finally {
    if (req.file) await cleanupFile(req.file.path).catch(() => {});
  }
}

module.exports = { markdownToPDF, pdfToMarkdown };
