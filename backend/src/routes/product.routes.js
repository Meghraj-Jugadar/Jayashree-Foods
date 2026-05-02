const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', getAll);
router.get('/:id', getById);
router.post('/', authenticate, authorize('admin'), upload.single('image'), create);
router.put('/:id', authenticate, authorize('admin'), upload.single('image'), update);
router.delete('/:id', authenticate, authorize('admin'), remove);

module.exports = router;
