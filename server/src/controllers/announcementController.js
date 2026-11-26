const Announcement = require('../models/Announcement');
const { isUploadPath } = require('./uploadController');
const { ApiError, asyncHandler, requireFields, isValidUrl } = require('../utils/http');

/** Validates optional link / attachment (external URL or an uploaded file). */
function checkUrls({ link, attachmentUrl }) {
  if (link && !isValidUrl(link)) throw new ApiError(400, 'Link must be a valid http(s) URL');
  if (attachmentUrl && !isValidUrl(attachmentUrl) && !isUploadPath(attachmentUrl)) {
    throw new ApiError(400, 'Attachment must be an uploaded file or a valid http(s) URL');
  }
}

/** Pulls the editable fields from the request body. */
const pickFields = ({ title, body, link = '', attachmentUrl = '', attachmentName = '' }) => ({
  title,
  body,
  link,
  attachmentUrl,
  attachmentName: attachmentUrl ? String(attachmentName).slice(0, 200) : '',
});

// GET /api/announcements?limit=  — everyone, newest first
exports.list = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 100);
  const list = await Announcement.find().populate('author', 'name adminTitle').sort({ createdAt: -1 }).limit(limit);
  res.json(list);
});

// POST /api/announcements  (admin)
exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'body']);
  const fields = pickFields(req.body);
  checkUrls(fields);
  const a = await Announcement.create({ ...fields, author: req.user._id });
  await a.populate('author', 'name adminTitle');
  res.status(201).json(a);
});

// PUT /api/announcements/:id  (admin)
exports.update = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'body']);
  const fields = pickFields(req.body);
  checkUrls(fields);
  const a = await Announcement.findByIdAndUpdate(req.params.id, fields, { new: true, runValidators: true }).populate('author', 'name adminTitle');
  if (!a) throw new ApiError(404, 'Announcement not found');
  res.json(a);
});

// DELETE /api/announcements/:id  (admin)
exports.remove = asyncHandler(async (req, res) => {
  const a = await Announcement.findByIdAndDelete(req.params.id);
  if (!a) throw new ApiError(404, 'Announcement not found');
  res.json({ message: 'Announcement deleted' });
});
