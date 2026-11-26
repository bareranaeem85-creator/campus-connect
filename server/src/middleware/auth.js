const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../utils/http');

/** Signs a JWT holding the user id. */
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

/** Requires a valid "Authorization: Bearer <token>" header; sets req.user. */
const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Please log in to continue');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Session expired, please log in again');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'Account no longer exists');
  req.user = user;
  next();
});

/** Only Admins (HOD / Head CR / Head GR) may pass. Use after `protect`. */
const requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') return next(new ApiError(403, 'Admin access required'));
  next();
};

/** True if user is an admin or a moderator of the given club document. */
const canModerate = (user, club) =>
  user.role === 'admin' || club.moderators.some((m) => String(m._id || m) === String(user._id));

module.exports = { signToken, protect, requireAdmin, canModerate };
