const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const router = express.Router();
const uploadDirectory = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename(request, file, callback) {
    const extension = allowedTypes.get(file.mimetype) || path.extname(file.originalname).toLowerCase();
    callback(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter(request, file, callback) {
    if (!allowedTypes.has(file.mimetype)) return callback(new Error('UNSUPPORTED_IMAGE'));
    return callback(null, true);
  },
});

router.post('/', upload.single('photo'), (request, response) => {
  if (!request.file) return response.status(400).json({ error: 'Choose a photo to upload.' });
  return response.status(201).json({ url: `/uploads/${request.file.filename}` });
});

module.exports = router;
