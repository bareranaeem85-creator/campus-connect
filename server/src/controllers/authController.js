const User = require('../models/User');
const Club = require('../models/Club');
const { signToken } = require('../middleware/auth');
const { ApiError, asyncHandler, requireFields } = require('../utils/http');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** User JSON + the ids of clubs they moderate / have joined (used by the UI for role-aware rendering). */
async function profilePayload(user) {
  const [moderatorOf, joined] = await Promise.all([
    Club.find({ moderators: user._id }).select('_id name slug'),
    Club.find({ members: user._id }).select('_id'),
  ]);
  return {
    ...user.toJSON(),
    moderatorOf,
    joinedClubs: joined.map((c) => c._id),
  };
}

// POST /api/auth/register — every new account is a student.
exports.register = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'password']);
  const { name, email, password } = req.body;
  if (!EMAIL_RE.test(email)) throw new ApiError(400, 'Please enter a valid email');
  if (password.length < 6) throw new ApiError(400, 'Password must be at least 6 characters');
  if (await User.exists({ email: email.toLowerCase() })) throw new ApiError(409, 'Email is already registered');

  const user = await User.create({ name, email, password, role: 'student' });
  res.status(201).json({ token: signToken(user._id), user: await profilePayload(user) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  res.json({ token: signToken(user._id), user: await profilePayload(user) });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: await profilePayload(req.user) });
});

// PATCH /api/auth/me — update name / bio
exports.updateMe = asyncHandler(async (req, res) => {
  const { name, bio } = req.body;
  if (name !== undefined) {
    if (!String(name).trim()) throw new ApiError(400, 'Name cannot be empty');
    req.user.name = name;
  }
  if (bio !== undefined) req.user.bio = bio;
  await req.user.save();
  res.json({ user: await profilePayload(req.user) });
});

exports.profilePayload = profilePayload;
