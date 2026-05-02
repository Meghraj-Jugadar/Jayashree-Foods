const router = require('express').Router();
const { getAll, update } = require('../controllers/settings.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', authenticate, getAll);
router.put('/', authenticate, authorize('admin'), update);

module.exports = router;
