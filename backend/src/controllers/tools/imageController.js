const imageService = require('../../services/tools/imageService');
const { success, badRequest } = require('../../utils/responseHelper');

const compressImage = async (req, res, next) => {
  if (!req.file) return badRequest(res, 'No image file uploaded');

  try {
    const { quality, format } = req.body;
    const result = await imageService.compressImage(req.file.path, { quality, format });

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="compressed.${result.extension}"`,
      'X-Original-Size': result.originalSize,
      'X-Compressed-Size': result.compressedSize,
      'X-Width': result.width,
      'X-Height': result.height,
    });

    res.send(result.buffer);
  } catch (err) {
    next(err);
  } finally {
    await imageService.cleanupFile(req.file.path);
  }
};

const resizeImage = async (req, res, next) => {
  if (!req.file) return badRequest(res, 'No image file uploaded');

  try {
    const { width, height, fit, format } = req.body;
    const result = await imageService.resizeImage(req.file.path, { width, height, fit, format });

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="resized.${result.extension}"`,
      'X-Width': result.width,
      'X-Height': result.height,
    });

    res.send(result.buffer);
  } catch (err) {
    next(err);
  } finally {
    await imageService.cleanupFile(req.file.path);
  }
};

const convertImage = async (req, res, next) => {
  if (!req.file) return badRequest(res, 'No image file uploaded');

  try {
    const { format, quality } = req.body;
    if (!format) return badRequest(res, 'Target format is required');

    const result = await imageService.convertImage(req.file.path, { format, quality });

    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="converted.${result.extension}"`,
      'X-Original-Size': result.originalSize,
      'X-Output-Size': result.outputSize,
      'X-Width': result.width,
      'X-Height': result.height,
    });

    res.send(result.buffer);
  } catch (err) {
    next(err);
  } finally {
    await imageService.cleanupFile(req.file.path);
  }
};

module.exports = { compressImage, resizeImage, convertImage };
