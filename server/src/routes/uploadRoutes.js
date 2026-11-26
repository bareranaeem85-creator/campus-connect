const router = require('express').Router();
const ctrl = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.post('/', protect, ctrl.upload); // any logged-in user (posts + announcements)
router.get('/:id', ctrl.download);

module.exports = router;
