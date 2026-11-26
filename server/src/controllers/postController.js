const Post = require('../models/Post');
const Club = require('../models/Club');
const Comment = require('../models/Comment');
const Attachment = require('../models/Attachment');
const { canModerate } = require('../middleware/auth');
const { ApiError, asyncHandler, requireFields, isValidUrl } = require('../utils/http');

const POPULATE = [
  { path: 'author', select: 'name role adminTitle' },
  { path: 'club', select: 'name slug color moderators' },
];

/** Adds viewer-specific fields (score, myVote, bookmarked) and hides raw vote arrays. */
function serialize(post, user) {
  const p = post.toObject();
  const uid = String(user._id);
  const up = p.upvotes.some((id) => String(id) === uid);
  const down = p.downvotes.some((id) => String(id) === uid);
  return {
    ...p,
    upvotes: undefined,
    downvotes: undefined,
    score: p.upvotes.length - p.downvotes.length,
    myVote: up ? 1 : down ? -1 : 0,
    bookmarked: user.bookmarks.some((id) => String(id) === String(p._id)),
    club: p.club && { _id: p.club._id, name: p.club.name, slug: p.club.slug, color: p.club.color },
  };
}

/** Sort: pinned first, then newest or highest score. */
function sortPosts(list, sort) {
  return list.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (sort === 'top' && b.score !== a.score) return b.score - a.score;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

async function loadPost(id) {
  const post = await Post.findById(id).populate(POPULATE);
  if (!post) throw new ApiError(404, 'Post not found');
  return post;
}

/** Members of the club (or its moderators / admins) can participate. */
function assertCanParticipate(user, club) {
  const isMember = club.members?.some((m) => String(m) === String(user._id));
  if (!isMember && !canModerate(user, club)) throw new ApiError(403, 'Join this club to participate');
}

// GET /api/posts?club=<id>&sort=new|top
exports.listPosts = asyncHandler(async (req, res) => {
  if (!req.query.club) throw new ApiError(400, 'club query parameter is required');
  const posts = await Post.find({ club: req.query.club }).populate(POPULATE).limit(200);
  res.json(sortPosts(posts.map((p) => serialize(p, req.user)), req.query.sort));
});

// GET /api/posts/feed — latest posts from the user's joined clubs (admins oversee all clubs)
exports.feed = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.user.role !== 'admin') filter.club = { $in: await Club.find({ members: req.user._id }).distinct('_id') };
  const posts = await Post.find(filter).populate(POPULATE).sort({ createdAt: -1 }).limit(30);
  const list = posts.map((p) => serialize(p, req.user));
  if (req.query.sort === 'top') list.sort((a, b) => b.score - a.score);
  res.json(list);
});

// GET /api/posts/bookmarks
exports.bookmarks = asyncHandler(async (req, res) => {
  const posts = await Post.find({ _id: { $in: req.user.bookmarks } }).populate(POPULATE).sort({ createdAt: -1 });
  res.json(posts.map((p) => serialize(p, req.user)));
});

// GET /api/posts/:id
exports.getPost = asyncHandler(async (req, res) => {
  res.json(serialize(await loadPost(req.params.id), req.user));
});

// POST /api/posts  body: { club, type, title, body, url }
exports.createPost = asyncHandler(async (req, res) => {
  requireFields(req.body, ['club', 'title']);
  const { club: clubId, title, body = '', url = '' } = req.body;
  const type = req.body.type === 'link' ? 'link' : 'text';

  const club = await Club.findById(clubId);
  if (!club) throw new ApiError(404, 'Club not found');
  assertCanParticipate(req.user, club);

  // Optional uploaded file: look it up so the stored name/type come from the server, not the client.
  let attachment;
  if (req.body.attachmentId) {
    const file = await Attachment.findById(req.body.attachmentId);
    if (!file) throw new ApiError(400, 'Attached file not found — please upload it again');
    attachment = { url: `/api/uploads/${file._id}`, filename: file.filename, mimetype: file.mimetype };
  }

  if (type === 'link' && !isValidUrl(url)) throw new ApiError(400, 'Please enter a valid link (http/https)');
  if (type === 'text' && !body.trim() && !attachment) throw new ApiError(400, 'Write something or attach a file');

  const post = await Post.create({ club: club._id, author: req.user._id, type, title, body, url: type === 'link' ? url : '', attachment });
  await post.populate(POPULATE);
  res.status(201).json(serialize(post, req.user));
});

// DELETE /api/posts/:id — author, club moderator, or admin
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await loadPost(req.params.id);
  const isAuthor = String(post.author._id) === String(req.user._id);
  if (!isAuthor && !canModerate(req.user, post.club)) throw new ApiError(403, 'You cannot delete this post');
  await Promise.all([Comment.deleteMany({ post: post._id }), post.deleteOne()]);
  res.json({ message: 'Post deleted' });
});

// PATCH /api/posts/:id/pin — toggle pin (club moderator or admin)
exports.togglePin = asyncHandler(async (req, res) => {
  const post = await loadPost(req.params.id);
  if (!canModerate(req.user, post.club)) throw new ApiError(403, 'Only this club’s moderators can pin posts');
  post.pinned = !post.pinned;
  await post.save();
  res.json(serialize(post, req.user));
});

// POST /api/posts/:id/vote  body: { value: 1 | -1 | 0 }
exports.vote = asyncHandler(async (req, res) => {
  const value = Number(req.body.value);
  if (![1, -1, 0].includes(value)) throw new ApiError(400, 'Vote must be 1, -1 or 0');
  const uid = req.user._id;
  // Remove any existing vote, then add the new one atomically.
  await Post.updateOne({ _id: req.params.id }, { $pull: { upvotes: uid, downvotes: uid } });
  if (value !== 0) {
    await Post.updateOne({ _id: req.params.id }, { $addToSet: { [value === 1 ? 'upvotes' : 'downvotes']: uid } });
  }
  res.json(serialize(await loadPost(req.params.id), req.user));
});

// POST /api/posts/:id/bookmark — toggle
exports.toggleBookmark = asyncHandler(async (req, res) => {
  const post = await loadPost(req.params.id);
  const has = req.user.bookmarks.some((id) => String(id) === String(post._id));
  req.user.bookmarks = has ? req.user.bookmarks.filter((id) => String(id) !== String(post._id)) : [...req.user.bookmarks, post._id];
  await req.user.save();
  res.json(serialize(post, req.user));
});

exports.assertCanParticipate = assertCanParticipate;
