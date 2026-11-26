const router = require('express').Router();
const User = require('../models/User');
const { protect, requireAdmin } = require('../middleware/auth');
const { asyncHandler, escapeRegex } = require('../utils/http');

// GET /api/users?q=  (admin) — used to pick moderators
router.get(
  '/',
  protect,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const filter = { role: 'student' };
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(req.query.q), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }
    res.json(await User.find(filter).select('name email').sort({ name: 1 }).limit(50));
  })
);

module.exports = router;
