const Attachment = require('../models/Attachment');
const { ApiError, asyncHandler, requireFields } = require('../utils/http');

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

// Whitelist of safe types. (No HTML/SVG — they could run scripts when opened.)
const ALLOWED_TYPES = {
  'application/pdf': 'PDF',
  'image/png': 'Image',
  'image/jpeg': 'Image',
  'image/gif': 'Image',
  'image/webp': 'Image',
  'application/msword': 'Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.ms-powerpoint': 'PowerPoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  'text/plain': 'Text',
};

/** Public metadata returned to the client. */
const toJSON = (a) => ({ _id: a._id, url: `/api/uploads/${a._id}`, filename: a.filename, mimetype: a.mimetype, size: a.size });

// POST /api/uploads  body: { filename, mimetype, data (base64) }
exports.upload = asyncHandler(async (req, res) => {
  requireFields(req.body, ['filename', 'mimetype', 'data']);
  const { filename, mimetype } = req.body;
  if (!ALLOWED_TYPES[mimetype]) throw new ApiError(400, 'Allowed files: PDF, images, Word, PowerPoint, text');

  const buffer = Buffer.from(String(req.body.data).replace(/^data:[^,]*,/, ''), 'base64');
  if (!buffer.length) throw new ApiError(400, 'File is empty');
  if (buffer.length > MAX_BYTES) throw new ApiError(400, 'File is too large (max 2 MB)');

  const a = await Attachment.create({
    filename: String(filename).replace(/[^\w.\- ()]/g, '_').slice(0, 200),
    mimetype,
    size: buffer.length,
    data: buffer,
    uploadedBy: req.user._id,
  });
  res.status(201).json(toJSON(a));
});

// GET /api/uploads/:id — public so plain <a>/<img> links work (ids are unguessable ObjectIds).
exports.download = asyncHandler(async (req, res) => {
  const a = await Attachment.findById(req.params.id).select('+data');
  if (!a) throw new ApiError(404, 'File not found');
  res.set({
    'Content-Type': a.mimetype,
    'Content-Length': a.size,
    'Content-Disposition': `${a.mimetype.startsWith('image/') || a.mimetype === 'application/pdf' ? 'inline' : 'attachment'}; filename="${a.filename}"`,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'public, max-age=31536000, immutable',
  });
  res.send(a.data);
});

/** True for our own upload links, e.g. "/api/uploads/<24-hex id>". */
exports.isUploadPath = (value) => /^\/api\/uploads\/[a-f0-9]{24}$/.test(value);
