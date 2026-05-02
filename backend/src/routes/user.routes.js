const router = require('express').Router();
const { getAllUsers, getUserById, toggleUserStatus } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/toggle-status', toggleUserStatus);

module.exports = router;
