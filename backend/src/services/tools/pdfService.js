const { PDFDocument } = require('pdf-lib');
const fs = require('fs').promises;
const sharp = require('sharp');
const { recordToolUse } = require('../../repositories/analyticsRepository');

/**
 * Merges multiple PDF files into one.
 */
async function mergePdfs(filePaths) {
  await recordToolUse('merge-pdfs').catch(() => {});

  if (!filePaths || filePaths.length < 2) {
    throw Object.assign(new Error('At least 2 PDF files required'), { statusCode: 400 });
  }

  const mergedDoc = await PDFDocument.create();

  for (const filePath of filePaths) {
    const bytes = await fs.readFile(filePath);
    const srcDoc = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
    pages.forEach(page => mergedDoc.addPage(page));
  }

  const pdfBytes = await mergedDoc.save();
  return {
    buffer: Buffer.from(pdfBytes),
    mimeType: 'application/pdf',
    extension: 'pdf',
    pageCount: mergedDoc.getPageCount(),
  };
}

/**
 * Splits a PDF — returns one PDF per page as separate buffers (ZIP via archive or multi-file download).
 * For simplicity, returns array of { pageNum, buffer }.
 */
async function splitPdf(filePath, { pages } = {}) {
  await recordToolUse('split-pdf').catch(() => {});

  const bytes = await fs.readFile(filePath);
  const srcDoc = await PDFDocument.load(bytes);
  const totalPages = srcDoc.getPageCount();

  // pages can be a specific range like "1,3,5-7" or undefined (split all)
  let pageIndices = srcDoc.getPageIndices();

  if (pages) {
    pageIndices = parsePageRange(pages, totalPages);
  }

  const results = [];

  for (const idx of pageIndices) {
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(srcDoc, [idx]);
    newDoc.addPage(copiedPage);
    const pdfBytes = await newDoc.save();
    results.push({
      pageNum: idx + 1,
      buffer: Buffer.from(pdfBytes),
    });
  }

  return {
    pages: results,
    totalPages,
    mimeType: 'application/pdf',
  };
}

/**
 * Converts multiple images into a single PDF.
 */
async function imagesToPdf(filePaths) {
  await recordToolUse('image-to-pdf').catch(() => {});

  if (!filePaths || filePaths.length === 0) {
    throw Object.assign(new Error('At least 1 image required'), { statusCode: 400 });
  }

  const pdfDoc = await PDFDocument.create();

  for (const filePath of filePaths) {
    const imgBuffer = await fs.readFile(filePath);
    const meta = await sharp(imgBuffer).metadata();

    // Convert everything to JPEG for embedding (pdf-lib supports JPG and PNG natively)
    let embedBuffer;
    let embeddedImage;

    if (meta.format === 'png') {
      const pngBuf = await sharp(imgBuffer).png().toBuffer();
      embeddedImage = await pdfDoc.embedPng(pngBuf);
    } else {
      const jpgBuf = await sharp(imgBuffer).jpeg({ quality: 95 }).toBuffer();
      embeddedImage = await pdfDoc.embedJpg(jpgBuf);
    }

    const { width, height } = embeddedImage.scale(1);

    // A4-ish sizing: scale image to fit within 595x842 points
    const maxW = 595;
    const maxH = 842;
    const scale = Math.min(maxW / width, maxH / height, 1);

    const page = pdfDoc.addPage([width * scale, height * scale]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: width * scale,
      height: height * scale,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return {
    buffer: Buffer.from(pdfBytes),
    mimeType: 'application/pdf',
    extension: 'pdf',
    pageCount: pdfDoc.getPageCount(),
  };
}

/**
 * Parse page range string like "1,3,5-7" into 0-based indices.
 */
function parsePageRange(rangeStr, totalPages) {
  const indices = new Set();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n));
      for (let i = start; i <= Math.min(end, totalPages); i++) {
        if (i >= 1) indices.add(i - 1);
      }
    } else {
      const n = parseInt(trimmed);
      if (n >= 1 && n <= totalPages) indices.add(n - 1);
    }
  }

  return [...indices].sort((a, b) => a - b);
}

async function cleanupFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (_) {}
}

module.exports = { mergePdfs, splitPdf, imagesToPdf, cleanupFile };
