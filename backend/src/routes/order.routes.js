const router = require('express').Router();
const { createOrder, getAllOrders, getOrderById, updateOrderStatus, getDashboardStats } = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/dashboard', authorize('admin'), getDashboardStats);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id/status', authorize('admin'), updateOrderStatus);

module.exports = router;
