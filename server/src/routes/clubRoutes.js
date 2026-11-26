const router = require('express').Router();
const ctrl = require('../controllers/clubController');
const { protect, requireAdmin } = require('../middleware/auth');

router.use(protect); // all club routes need login

router.get('/', ctrl.listClubs);
router.post('/', requireAdmin, ctrl.createClub);
router.get('/:slug', ctrl.getClub);
router.get('/:slug/members', ctrl.getMembers);
router.post('/:id/join', ctrl.joinClub);
router.post('/:id/leave', ctrl.leaveClub);
router.delete('/:id', requireAdmin, ctrl.deleteClub);
router.post('/:id/moderators', requireAdmin, ctrl.addModerator);
router.delete('/:id/moderators/:userId', requireAdmin, ctrl.removeModerator);

module.exports = router;
