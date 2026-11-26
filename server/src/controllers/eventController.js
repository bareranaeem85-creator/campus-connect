const Event = require('../models/Event');
const { ApiError, asyncHandler, requireFields } = require('../utils/http');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Event dates are stored at 12:00 UTC of the calendar day, so the day never shifts
 * between timezones. "Upcoming" = on or after 00:00 UTC today.
 */
const startOfToday = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

/** "2026-12-01" -> Date at 12:00 UTC; validates all event fields. */
function parseEventBody(body) {
  requireFields(body, ['title', 'description', 'date', 'time', 'venue']);
  if (!DATE_RE.test(body.date)) throw new ApiError(400, 'Date must be in YYYY-MM-DD format');
  const [y, m, d] = body.date.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  if (Number.isNaN(date.getTime())) throw new ApiError(400, 'Invalid date');
  return { title: body.title, description: body.description, date, time: body.time, venue: body.venue };
}

// GET /api/events?when=upcoming|past&limit=
exports.list = asyncHandler(async (req, res) => {
  const today = startOfToday();
  const past = req.query.when === 'past';
  const filter = past ? { date: { $lt: today } } : { date: { $gte: today } };
  const limit = Math.min(Number(req.query.limit) || 200, 200);
  const events = await Event.find(filter)
    .populate('createdBy', 'name adminTitle')
    .sort(past ? { date: -1, time: -1 } : { date: 1, time: 1 }) // upcoming: soonest first; past: most recent first
    .limit(limit);
  res.json(events);
});

// POST /api/events  (admin)
exports.create = asyncHandler(async (req, res) => {
  const e = await Event.create({ ...parseEventBody(req.body), createdBy: req.user._id });
  res.status(201).json(e);
});

// PUT /api/events/:id  (admin)
exports.update = asyncHandler(async (req, res) => {
  const e = await Event.findByIdAndUpdate(req.params.id, parseEventBody(req.body), { new: true, runValidators: true });
  if (!e) throw new ApiError(404, 'Event not found');
  res.json(e);
});

// PATCH /api/events/:id/status  (admin) body: { status: 'cancelled' | 'scheduled' }
exports.setStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['cancelled', 'scheduled'].includes(status)) throw new ApiError(400, 'Status must be cancelled or scheduled');
  const e = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!e) throw new ApiError(404, 'Event not found');
  res.json(e);
});

// DELETE /api/events/:id  (admin)
exports.remove = asyncHandler(async (req, res) => {
  const e = await Event.findByIdAndDelete(req.params.id);
  if (!e) throw new ApiError(404, 'Event not found');
  res.json({ message: 'Event deleted' });
});
