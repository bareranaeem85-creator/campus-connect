const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors());
// Uploads send base64 file data, so they get a bigger body limit (2 MB file ≈ 2.7 MB base64).
app.use('/api/uploads', express.json({ limit: '3mb' }), require('./routes/uploadRoutes'));
app.use(express.json({ limit: '1mb' }));

// ---- API routes ----
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/clubs', require('./routes/clubRoutes'));
app.use('/api/club-requests', require('./routes/clubRequestRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
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
