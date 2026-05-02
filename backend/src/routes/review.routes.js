const router = require('express').Router();
const { getReviews, createReview, deleteReview } = require('../controllers/review.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

router.get('/', getReviews); // public
router.post('/', authenticate, createReview); // any logged-in user
router.delete('/:id', authenticate, deleteReview); // owner or admin

module.exports = router;
