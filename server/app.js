const cors = require('cors');
const express = require('express');
const path = require('path');

const healthRouter = require('./routes/health');
const vehiclesRouter = require('./routes/vehicles');
const modificationsRouter = require('./routes/modifications');
const uploadsRouter = require('./routes/uploads');
const { router: authRouter, requireOwner, requireClientOrigin } = require('./auth');
const prisma = require('./db');
const { photoBucket, photoStorageMode } = require('./storage');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
async function sendPhoto(name, response) {
  if (photoStorageMode() === 'local') {
    return response.sendFile(path.join(__dirname, 'uploads', name));
  }
  const { data, error } = await photoBucket().createSignedUrl(name, 60);
  if (error) {
    if (String(error.statusCode) === '404' || error.status === 404) return response.status(404).send();
    throw error;
  }
  return response.redirect(302, data.signedUrl);
}

app.get('/uploads/:name', async (request, response, next) => {
  try {
    const name = request.params.name;
    if (!/^[a-zA-Z0-9._-]+$/.test(name)) return response.status(404).send();
    const published = await prisma.vehicle.findFirst({ where: { showcasePublished: true, finalImageUrl: `/uploads/${name}` }, select: { id: true } });
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', published ? 'public, max-age=30' : 'private, no-store');
    if (published) return await sendPhoto(name, response);
    return requireOwner(request, response, (error) => {
      if (error) return next(error);
      return sendPhoto(name, response).catch(next);
    });
  } catch (error) { return next(error); }
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/vehicles', (request, response, next) => request.method === 'GET' ? next() : requireClientOrigin(request, response, next), vehiclesRouter);
app.use('/api/modifications', requireOwner, (request, response, next) => request.method === 'GET' ? next() : requireClientOrigin(request, response, next), modificationsRouter);
app.use('/api/uploads', requireOwner, requireClientOrigin, uploadsRouter);

app.use((request, response) => {
  response.status(404).json({
    error: 'Route not found',
  });
});

app.use((error, request, response, next) => {
  void request;
  void next;
  console.error(error);

  if (error?.code === 'ECONNREFUSED' || error?.code === 'P1001') {
    return response.status(503).json({
      error: 'BuildSpec could not connect to PostgreSQL. Start the database service, then try again.',
    });
  }

  if (error?.code === 'LIMIT_FILE_SIZE') return response.status(413).json({ error: 'That photo is larger than 8 MB. Choose a smaller image.' });
  if (error?.message === 'UNSUPPORTED_IMAGE') return response.status(400).json({ error: 'Choose a JPG, PNG, or WebP image.' });
  if (error?.code === 'STORAGE_NOT_CONFIGURED') return response.status(503).json({ error: error.message });

  response.status(500).json({ error: 'The database request could not be completed.' });
});

module.exports = app;
