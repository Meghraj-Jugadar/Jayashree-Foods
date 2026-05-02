const router = require('express').Router();
const { getAll, create, update, remove } = require('../controllers/category.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', getAll);
router.post('/', authenticate, authorize('admin'), create);
router.put('/:id', authenticate, authorize('admin'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;
