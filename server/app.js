const cors = require('cors');
const express = require('express');
const path = require('path');

const healthRouter = require('./routes/health');
const vehiclesRouter = require('./routes/vehicles');
const modificationsRouter = require('./routes/modifications');
const uploadsRouter = require('./routes/uploads');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  }),
);
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { fallthrough: false, maxAge: '1d' }));

app.use('/api/health', healthRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/modifications', modificationsRouter);
app.use('/api/uploads', uploadsRouter);

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

  response.status(500).json({ error: 'The database request could not be completed.' });
});

module.exports = app;
