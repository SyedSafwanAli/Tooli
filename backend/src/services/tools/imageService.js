const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { recordToolUse } = require('../../repositories/analyticsRepository');

/**
 * Compresses an image, reducing file size.
 * Returns buffer and metadata.
 */
async function compressImage(filePath, { quality = 80, format } = {}) {
  await recordToolUse('compress-image').catch(() => {});

  const inputBuffer = await fs.readFile(filePath);
  const meta = await sharp(inputBuffer).metadata();
  const outputFormat = format || meta.format || 'jpeg';

  const q = Math.min(100, Math.max(1, parseInt(quality)));

  let pipeline = sharp(inputBuffer);

  switch (outputFormat) {
    case 'jpeg':
    case 'jpg':
      pipeline = pipeline.jpeg({ quality: q, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ quality: q, compressionLevel: 9 });
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: q });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality: q });
      break;
    default:
      pipeline = pipeline.jpeg({ quality: q });
  }

  const outputBuffer = await pipeline.toBuffer();
  const outMeta = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    mimeType: `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`,
    extension: outputFormat === 'jpg' ? 'jpg' : outputFormat,
    originalSize: (await fs.stat(filePath)).size,
    compressedSize: outputBuffer.length,
    width: outMeta.width,
    height: outMeta.height,
  };
}

/**
 * Resizes an image to given width and/or height.
 */
async function resizeImage(filePath, { width, height, fit = 'cover', format } = {}) {
  await recordToolUse('resize-image').catch(() => {});

  const inputBuffer = await fs.readFile(filePath);
  const meta = await sharp(inputBuffer).metadata();
  const outputFormat = format || meta.format || 'jpeg';

  const w = width ? parseInt(width) : undefined;
  const h = height ? parseInt(height) : undefined;

  if (!w && !h) throw Object.assign(new Error('Provide at least width or height'), { statusCode: 400 });

  let pipeline = sharp(inputBuffer).resize(w, h, { fit, withoutEnlargement: false });

  switch (outputFormat) {
    case 'jpeg':
    case 'jpg':
      pipeline = pipeline.jpeg({ quality: 90 });
      break;
    case 'png':
      pipeline = pipeline.png();
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: 90 });
      break;
    default:
      pipeline = pipeline.jpeg({ quality: 90 });
  }

  const outputBuffer = await pipeline.toBuffer();
  const outMeta = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    mimeType: `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`,
    extension: outputFormat === 'jpg' ? 'jpg' : outputFormat,
    width: outMeta.width,
    height: outMeta.height,
  };
}

/**
 * Converts image to a different format.
 */
async function convertImage(filePath, { format = 'webp', quality = 90 } = {}) {
  await recordToolUse('convert-image').catch(() => {});

  const inputBuffer = await fs.readFile(filePath);
  const q = Math.min(100, Math.max(1, parseInt(quality)));

  let pipeline = sharp(inputBuffer);

  switch (format) {
    case 'jpeg':
    case 'jpg':
      pipeline = pipeline.jpeg({ quality: q });
      break;
    case 'png':
      pipeline = pipeline.png();
      break;
    case 'webp':
      pipeline = pipeline.webp({ quality: q });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality: q });
      break;
    case 'tiff':
      pipeline = pipeline.tiff({ quality: q });
      break;
    default:
      throw Object.assign(new Error(`Unsupported format: ${format}`), { statusCode: 400 });
  }

  const outputBuffer = await pipeline.toBuffer();
  const outMeta = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    mimeType: `image/${format === 'jpg' ? 'jpeg' : format}`,
    extension: format,
    width: outMeta.width,
    height: outMeta.height,
    originalSize: (await fs.stat(filePath)).size,
    outputSize: outputBuffer.length,
  };
}

async function cleanupFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (_) {}
}

module.exports = { compressImage, resizeImage, convertImage, cleanupFile };
