const router = require('express').Router();
const Club = require('../models/Club');
const User = require('../models/User');
const Event = require('../models/Event');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../utils/http');

// GET /api/stats — quick numbers for the home hero
router.get(
  '/',
  protect,
  asyncHandler(async (_req, res) => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const [clubs, members, upcomingEvents] = await Promise.all([
      Club.countDocuments(),
      User.countDocuments(),
      Event.countDocuments({ date: { $gte: today }, status: 'scheduled' }),
    ]);
    res.json({ clubs, members, upcomingEvents });
  })
);

module.exports = router;
