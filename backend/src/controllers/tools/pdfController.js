const pdfService = require('../../services/tools/pdfService');
const { badRequest } = require('../../utils/responseHelper');
const archiver = require('archiver');

const mergePdfs = async (req, res, next) => {
  if (!req.files || req.files.length < 2) {
    return badRequest(res, 'At least 2 PDF files are required');
  }

  const filePaths = req.files.map(f => f.path);

  try {
    const result = await pdfService.mergePdfs(filePaths);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="merged.pdf"',
      'X-Page-Count': result.pageCount,
    });

    res.send(result.buffer);
  } catch (err) {
    next(err);
  } finally {
    for (const fp of filePaths) await pdfService.cleanupFile(fp);
  }
};

const splitPdf = async (req, res, next) => {
  if (!req.file) return badRequest(res, 'No PDF file uploaded');

  const filePath = req.file.path;

  try {
    const { pages } = req.body;
    const result = await pdfService.splitPdf(filePath, { pages });

    if (result.pages.length === 1) {
      // Single page — return directly
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="page-${result.pages[0].pageNum}.pdf"`,
      });
      return res.send(result.pages[0].buffer);
    }

    // Multiple pages — return as ZIP
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="split-pages.zip"',
    });

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const { pageNum, buffer } of result.pages) {
      archive.append(buffer, { name: `page-${pageNum}.pdf` });
    }

    await archive.finalize();
  } catch (err) {
    next(err);
  } finally {
    await pdfService.cleanupFile(filePath);
  }
};

const imagesToPdf = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return badRequest(res, 'At least 1 image file is required');
  }

  const filePaths = req.files.map(f => f.path);

  try {
    const result = await pdfService.imagesToPdf(filePaths);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="images.pdf"',
      'X-Page-Count': result.pageCount,
    });

    res.send(result.buffer);
  } catch (err) {
    next(err);
  } finally {
    for (const fp of filePaths) await pdfService.cleanupFile(fp);
  }
};

module.exports = { mergePdfs, splitPdf, imagesToPdf };
