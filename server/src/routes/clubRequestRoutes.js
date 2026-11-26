const router = require('express').Router();
const ctrl = require('../controllers/clubRequestController');
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect);

router.post('/', ctrl.createRequest);
router.get('/mine', ctrl.myRequests);
router.get('/', requireAdmin, ctrl.listRequests);
router.post('/:id/approve', requireAdmin, ctrl.approveRequest);
router.post('/:id/reject', requireAdmin, ctrl.rejectRequest);

module.exports = router;
