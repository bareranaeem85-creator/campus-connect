const Club = require('../models/Club');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { ApiError, asyncHandler, requireFields, escapeRegex, exactCI } = require('../utils/http');

const BLOB_COLORS = ['#EB2F33', '#639CC5', '#F3EFE7', '#F2B544', '#9CC9E8', '#FF8A73']; // palette-matched blob colours

/** Public shape of a club: counts instead of full member arrays, plus viewer flags. */
const serialize = (club, userId) => ({
  _id: club._id,
  name: club.name,
  slug: club.slug,
  description: club.description,
  color: club.color,
  memberCount: club.members.length,
  isMember: club.members.some((m) => String(m._id || m) === String(userId)),
  moderators: club.moderators,
  createdAt: club.createdAt,
});

/** Creates a club (used by admin create + request approval). */
async function createClubRecord({ name, description, createdBy, firstMember }) {
  const slug = Club.slugify(name);
  if (!slug) throw new ApiError(400, 'Club name must contain letters or numbers');
  if (await Club.exists({ $or: [{ slug }, { name: exactCI(name) }] })) {
    throw new ApiError(409, 'A club with this name already exists');
  }
  const color = BLOB_COLORS[(await Club.estimatedDocumentCount()) % BLOB_COLORS.length];
  return Club.create({ name, slug, description, color, createdBy, members: firstMember ? [firstMember] : [] });
}
exports.createClubRecord = createClubRecord;

// GET /api/clubs?q=search
exports.listClubs = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ name: rx }, { description: rx }];
  }
  const clubs = await Club.find(filter).populate('moderators', 'name').sort({ name: 1 });
  res.json(clubs.map((c) => serialize(c, req.user._id)));
});

// GET /api/clubs/:slug
exports.getClub = asyncHandler(async (req, res) => {
  const club = await Club.findOne({ slug: req.params.slug }).populate('moderators', 'name email');
  if (!club) throw new ApiError(404, 'Club not found');
  const postCount = await Post.countDocuments({ club: club._id });
  res.json({ ...serialize(club, req.user._id), postCount });
});

// GET /api/clubs/:slug/members
exports.getMembers = asyncHandler(async (req, res) => {
  const club = await Club.findOne({ slug: req.params.slug }).populate('members', 'name role adminTitle');
  if (!club) throw new ApiError(404, 'Club not found');
  res.json(club.members);
});

// POST /api/clubs/:id/join
exports.joinClub = asyncHandler(async (req, res) => {
  const club = await Club.findByIdAndUpdate(req.params.id, { $addToSet: { members: req.user._id } }, { new: true });
  if (!club) throw new ApiError(404, 'Club not found');
  res.json(serialize(club, req.user._id));
});

// POST /api/clubs/:id/leave
exports.leaveClub = asyncHandler(async (req, res) => {
  const club = await Club.findByIdAndUpdate(req.params.id, { $pull: { members: req.user._id } }, { new: true });
  if (!club) throw new ApiError(404, 'Club not found');
  res.json(serialize(club, req.user._id));
});

// POST /api/clubs  (admin) — create a club directly
exports.createClub = asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'description']);
  const club = await createClubRecord({ ...req.body, createdBy: req.user._id });
  res.status(201).json(serialize(club, req.user._id));
});

// DELETE /api/clubs/:id  (admin) — removes the club and all its discussions
exports.deleteClub = asyncHandler(async (req, res) => {
  const club = await Club.findByIdAndDelete(req.params.id);
  if (!club) throw new ApiError(404, 'Club not found');
  const postIds = await Post.find({ club: club._id }).distinct('_id');
  await Promise.all([Comment.deleteMany({ post: { $in: postIds } }), Post.deleteMany({ club: club._id })]);
  res.json({ message: 'Club deleted' });
});

// POST /api/clubs/:id/moderators  (admin) body: { userId }
exports.addModerator = asyncHandler(async (req, res) => {
  requireFields(req.body, ['userId']);
  const user = await User.findById(req.body.userId);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(400, 'Admins already moderate every club');
  // Moderators are automatically members of the club they moderate.
  const club = await Club.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { moderators: user._id, members: user._id } },
    { new: true }
  ).populate('moderators', 'name email');
  if (!club) throw new ApiError(404, 'Club not found');
  res.json(serialize(club, req.user._id));
});

// DELETE /api/clubs/:id/moderators/:userId  (admin)
exports.removeModerator = asyncHandler(async (req, res) => {
  const club = await Club.findByIdAndUpdate(
    req.params.id,
    { $pull: { moderators: req.params.userId } },
    { new: true }
  ).populate('moderators', 'name email');
  if (!club) throw new ApiError(404, 'Club not found');
  res.json(serialize(club, req.user._id));
});
