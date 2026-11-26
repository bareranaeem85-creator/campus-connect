const Announcement = require('../models/Announcement');
const { ApiError, asyncHandler, requireFields, isValidUrl } = require('../utils/http');

/** Validates optional link / attachment URLs. */
function checkUrls({ link, attachmentUrl }) {
  if (link && !isValidUrl(link)) throw new ApiError(400, 'Link must be a valid http(s) URL');
  if (attachmentUrl && !isValidUrl(attachmentUrl)) throw new ApiError(400, 'Attachment must be a valid http(s) URL');
}

// GET /api/announcements?limit=  — everyone, newest first
exports.list = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 100);
  const list = await Announcement.find().populate('author', 'name adminTitle').sort({ createdAt: -1 }).limit(limit);
  res.json(list);
});

// POST /api/announcements  (admin)
exports.create = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'body']);
  const { title, body, link = '', attachmentUrl = '' } = req.body;
  checkUrls({ link, attachmentUrl });
  const a = await Announcement.create({ title, body, link, attachmentUrl, author: req.user._id });
  await a.populate('author', 'name adminTitle');
  res.status(201).json(a);
});

// PUT /api/announcements/:id  (admin)
exports.update = asyncHandler(async (req, res) => {
  requireFields(req.body, ['title', 'body']);
  const { title, body, link = '', attachmentUrl = '' } = req.body;
  checkUrls({ link, attachmentUrl });
  const a = await Announcement.findByIdAndUpdate(req.params.id, { title, body, link, attachmentUrl }, { new: true, runValidators: true }).populate('author', 'name adminTitle');
  if (!a) throw new ApiError(404, 'Announcement not found');
  res.json(a);
});

// DELETE /api/announcements/:id  (admin)
exports.remove = asyncHandler(async (req, res) => {
  const a = await Announcement.findByIdAndDelete(req.params.id);
  if (!a) throw new ApiError(404, 'Announcement not found');
  res.json({ message: 'Announcement deleted' });
});
