const express = require('express');
const router = express.Router();
const imageController = require('../controllers/tools/imageController');
const pdfController = require('../controllers/tools/pdfController');
const { toolsLimiter } = require('../middleware/rateLimiter');
const {
  uploadImage,
  uploadMultiPDF,
  uploadPDF,
  uploadMultiImage,
} = require('../middleware/upload');

router.use(toolsLimiter);

// Image tools
router.post('/compress-image', uploadImage.single('image'), imageController.compressImage);
router.post('/resize-image', uploadImage.single('image'), imageController.resizeImage);
router.post('/convert-image', uploadImage.single('image'), imageController.convertImage);

// PDF tools
router.post('/merge-pdfs', uploadMultiPDF.array('pdfs', 10), pdfController.mergePdfs);
router.post('/split-pdf', uploadPDF.single('pdf'), pdfController.splitPdf);
router.post('/image-to-pdf', uploadMultiImage.array('images', 10), pdfController.imagesToPdf);

module.exports = router;
