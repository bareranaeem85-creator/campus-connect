const router = require('express').Router();
const ctrl = require('../controllers/announcementController');
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect);

router.get('/', ctrl.list);
router.post('/', requireAdmin, ctrl.create);
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
