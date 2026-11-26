const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Club = require('../models/Club');
const { canModerate } = require('../middleware/auth');
const { assertCanParticipate } = require('./postController');
const { ApiError, asyncHandler, requireFields } = require('../utils/http');

// GET /api/posts/:postId/comments — flat list (oldest first); the client builds the reply tree via `parent`.
exports.listComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate('author', 'name role adminTitle')
    .sort({ createdAt: 1 });
  res.json(comments);
});

// POST /api/posts/:postId/comments  body: { body, parent? }
exports.addComment = asyncHandler(async (req, res) => {
  requireFields(req.body, ['body']);
  const post = await Post.findById(req.params.postId);
  if (!post) throw new ApiError(404, 'Post not found');
  assertCanParticipate(req.user, await Club.findById(post.club));

  let parent = null;
  if (req.body.parent) {
    parent = await Comment.findOne({ _id: req.body.parent, post: post._id });
    if (!parent) throw new ApiError(400, 'The comment you are replying to no longer exists');
  }

  const comment = await Comment.create({ post: post._id, author: req.user._id, parent: parent?._id || null, body: req.body.body });
  await Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
  await comment.populate('author', 'name role adminTitle');
  res.status(201).json(comment);
});

// DELETE /api/comments/:id — author, club moderator, or admin. Removes the whole reply thread beneath it.
exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError(404, 'Comment not found');
  const post = await Post.findById(comment.post);
  const club = await Club.findById(post.club);

  const isAuthor = String(comment.author) === String(req.user._id);
  if (!isAuthor && !canModerate(req.user, club)) throw new ApiError(403, 'You cannot delete this comment');

  // Collect all descendant reply ids (breadth-first).
  const ids = [comment._id];
  for (let frontier = [comment._id]; frontier.length; ) {
    frontier = await Comment.find({ parent: { $in: frontier } }).distinct('_id');
    ids.push(...frontier);
  }
  await Comment.deleteMany({ _id: { $in: ids } });
  await Post.updateOne({ _id: post._id }, { $inc: { commentCount: -ids.length } });
  res.json({ message: 'Comment deleted', deletedIds: ids });
});
