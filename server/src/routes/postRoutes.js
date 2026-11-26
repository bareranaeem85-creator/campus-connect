const router = require('express').Router();
const posts = require('../controllers/postController');
const comments = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', posts.listPosts);
router.get('/feed', posts.feed);
router.get('/bookmarks', posts.bookmarks);
router.post('/', posts.createPost);
router.get('/:id', posts.getPost);
router.delete('/:id', posts.deletePost);
router.patch('/:id/pin', posts.togglePin);
router.post('/:id/vote', posts.vote);
router.post('/:id/bookmark', posts.toggleBookmark);

router.get('/:postId/comments', comments.listComments);
router.post('/:postId/comments', comments.addComment);

module.exports = router;
