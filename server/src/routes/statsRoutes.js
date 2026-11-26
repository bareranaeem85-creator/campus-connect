const router = require('express').Router();
const Club = require('../models/Club');
const User = require('../models/User');
const Event = require('../models/Event');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../utils/http');

const startOfTodayUTC = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

async function counts() {
  const [clubs, members, posts, upcomingEvents] = await Promise.all([
    Club.countDocuments(),
    User.countDocuments(),
    Post.countDocuments(),
    Event.countDocuments({ date: { $gte: startOfTodayUTC() }, status: 'scheduled' }),
  ]);
  return { clubs, members, posts, upcomingEvents };
}

// GET /api/stats — quick numbers for the dashboard hero (logged in)
router.get('/', protect, asyncHandler(async (_req, res) => res.json(await counts())));

// GET /api/stats/public — safe, read-only highlights for the public landing page.
// Only aggregate counts, club names and upcoming event basics: no user data, no posts.
router.get(
  '/public',
  asyncHandler(async (_req, res) => {
    const [stats, clubs, events] = await Promise.all([
      counts(),
      Club.find().select('name slug color description members').sort({ name: 1 }).limit(12),
      Event.find({ date: { $gte: startOfTodayUTC() }, status: 'scheduled' })
        .select('title date time venue')
        .sort({ date: 1, time: 1 })
        .limit(3),
    ]);
    res.json({
      stats,
      clubs: clubs.map((c) => ({ name: c.name, slug: c.slug, color: c.color, description: c.description, memberCount: c.members.length })),
      events,
    });
  })
);

module.exports = router;
