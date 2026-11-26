const router = require('express').Router();
const ctrl = require('../controllers/eventController');
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect);

router.get('/', ctrl.list);
router.post('/', requireAdmin, ctrl.create);
router.put('/:id', requireAdmin, ctrl.update);
router.patch('/:id/status', requireAdmin, ctrl.setStatus);
router.delete('/:id', requireAdmin, ctrl.remove);

module.exports = router;
