const router = require('express').Router();
const { getSalesReport, exportCSV } = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.use(authenticate, authorize('admin'));

router.get('/sales', getSalesReport);
router.get('/export/csv', exportCSV);

module.exports = router;
