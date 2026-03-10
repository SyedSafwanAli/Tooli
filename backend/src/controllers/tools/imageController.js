const imageService = require('../../services/tools/imageService');
const { success, badRequest } = require('../../utils/responseHelper');
const logsRepo = require('../../repositories/logsRepository');

const compressImage = async (req, res, next) => {
  if (!req.file) return badRequest(res, 'No image file uploaded');

  const start = Date.now();
  let status = 'success';

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
    status = 'error';
    next(err);
  } finally {
    await imageService.cleanupFile(req.file.path);
    logsRepo.addLog({
      tool: 'compress-image',
      filename: req.file.originalname,
      fileSize: req.file.size,
      duration: Date.now() - start,
      status,
    });
  }
};

const resizeImage = async (req, res, next) => {
  if (!req.file) return badRequest(res, 'No image file uploaded');

  const start = Date.now();
  let status = 'success';

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
    status = 'error';
    next(err);
  } finally {
    await imageService.cleanupFile(req.file.path);
    logsRepo.addLog({
      tool: 'resize-image',
      filename: req.file.originalname,
      fileSize: req.file.size,
      duration: Date.now() - start,
      status,
    });
  }
};

const convertImage = async (req, res, next) => {
  if (!req.file) return badRequest(res, 'No image file uploaded');

  const start = Date.now();
  let status = 'success';

  try {
    const { format, quality, width, height, fit, rotate, flipH, flipV } = req.body;
    if (!format) return badRequest(res, 'Target format is required');

    const result = await imageService.convertImage(req.file.path, {
      format,
      quality,
      width,
      height,
      fit,
      rotate,
      flipH: flipH === 'true',
      flipV: flipV === 'true',
    });

    res.set({
      'Content-Type':        result.mimeType,
      'Content-Disposition': `attachment; filename="converted.${result.extension}"`,
      'X-Original-Size':     result.originalSize,
      'X-Output-Size':       result.outputSize,
      'X-Width':             result.width,
      'X-Height':            result.height,
    });

    res.send(result.buffer);
  } catch (err) {
    status = 'error';
    next(err);
  } finally {
    await imageService.cleanupFile(req.file.path);
    logsRepo.addLog({
      tool: 'convert-image',
      filename: req.file.originalname,
      fileSize: req.file.size,
      duration: Date.now() - start,
      status,
    });
  }
};

module.exports = { compressImage, resizeImage, convertImage };
