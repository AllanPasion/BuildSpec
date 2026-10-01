const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');

const router = express.Router();
const uploadDirectory = path.join(__dirname, '..', 'uploads');
const { photoBucket, photoStorageMode } = require('../storage');

const allowedTypes = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter(request, file, callback) {
    if (!allowedTypes.has(file.mimetype)) return callback(new Error('UNSUPPORTED_IMAGE'));
    return callback(null, true);
  },
});

router.post('/sign', async (request, response, next) => {
  const { type, size } = request.body || {};
  if (!allowedTypes.has(type)) return response.status(400).json({ error: 'Choose a JPG, PNG, or WebP image.' });
  if (!Number.isInteger(size) || size < 1 || size > 8 * 1024 * 1024) return response.status(400).json({ error: 'Choose an image up to 8 MB.' });
  try {
    if (photoStorageMode() === 'local') return response.json({ mode: 'local' });
    const name = `${Date.now()}-${crypto.randomUUID()}${allowedTypes.get(type)}`;
    const { data, error } = await photoBucket().createSignedUploadUrl(name);
    if (error) throw error;
    return response.json({ mode: 'supabase', signedUrl: data.signedUrl, url: `/uploads/${name}` });
  } catch (error) { return next(error); }
});

router.post('/', (request, response, next) => {
  try {
    if (photoStorageMode() !== 'local') return response.status(400).json({ error: 'Use the signed photo upload flow.' });
    return next();
  } catch (error) { return next(error); }
}, upload.single('photo'), async (request, response, next) => {
  if (!request.file) return response.status(400).json({ error: 'Choose a photo to upload.' });
  const name = `${Date.now()}-${crypto.randomUUID()}${allowedTypes.get(request.file.mimetype)}`;
  try {
    await fs.promises.mkdir(uploadDirectory, { recursive: true });
    await fs.promises.writeFile(path.join(uploadDirectory, name), request.file.buffer, { flag: 'wx' });
    return response.status(201).json({ url: `/uploads/${name}` });
  } catch (error) { return next(error); }
});

module.exports = router;
