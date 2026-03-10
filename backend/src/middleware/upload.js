const multer = require('multer');
const path = require('path');
const config = require('../config');

const storage = multer.diskStorage({
  destination: config.upload.uploadDir,
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|avif|tiff/;
  if (allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || path.extname(file.originalname).toLowerCase() === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

const imageOrPdfFilter = (req, file, cb) => {
  const imgAllowed = /jpeg|jpg|png|webp|gif|avif|tiff/;
  const isPdf = file.mimetype === 'application/pdf';
  const isImg = imgAllowed.test(file.mimetype);
  if (isPdf || isImg) {
    cb(null, true);
  } else {
    cb(new Error('Only image or PDF files are allowed'));
  }
};

const uploadImage = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: imageFilter,
});

const uploadPDF = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: pdfFilter,
});

const uploadMultiPDF = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize, files: 10 },
  fileFilter: pdfFilter,
});

const uploadImageOrPDF = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: imageOrPdfFilter,
});

const uploadMultiImage = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize, files: 10 },
  fileFilter: imageFilter,
});

const markdownFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const ok  = ['.md', '.markdown', '.txt'].includes(ext)
    || file.mimetype.startsWith('text/');
  if (ok) cb(null, true);
  else cb(new Error('Only Markdown (.md) or plain-text files are allowed'));
};

const uploadMarkdown = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: markdownFilter,
});

module.exports = { uploadImage, uploadPDF, uploadMultiPDF, uploadImageOrPDF, uploadMultiImage, uploadMarkdown };
