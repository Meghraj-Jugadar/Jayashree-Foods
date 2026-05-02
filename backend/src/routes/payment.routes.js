const router = require('express').Router();
const { processPayment, getPaymentByOrder } = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.post('/process', processPayment);
router.get('/order/:orderId', getPaymentByOrder);

module.exports = router;
