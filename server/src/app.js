const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// ---- API routes ----
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/club-requests', require('./routes/clubRequestRoutes'));
app.use('/api', notFound);

// ---- Serve the built React app in production (single Render service) ----
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // Any non-API route returns index.html so React Router can handle it.
  app.get('*', (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.use(errorHandler);

module.exports = app;
