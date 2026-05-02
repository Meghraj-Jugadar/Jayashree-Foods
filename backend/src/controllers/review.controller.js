const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const getReviews = async (req, res) => {
  logger.info('reviews.getAll', { query: req.query });
  try {
    const { productId, page = 1, limit = 20 } = req.query;
    const where = productId ? { productId: parseInt(productId) } : {};
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: { user: { select: { name: true } }, product: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      prisma.review.count({ where }),
    ]);
    logger.info('reviews.getAll: success', { total, productId });
    return successResponse(res, reviews, 'Reviews fetched', 200, { total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    logger.error('reviews.getAll: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch reviews', 500);
  }
};

const createReview = async (req, res) => {
  logger.info('reviews.create', { productId: req.body.productId, userId: req.user?.id });
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || rating < 1 || rating > 5) {
      logger.warn('reviews.create: invalid input', { productId, rating });
      return errorResponse(res, 'productId and rating (1-5) are required', 400);
    }

    const review = await prisma.review.upsert({
      where: { userId_productId: { userId: req.user.id, productId: parseInt(productId) } },
      update: { rating: parseInt(rating), comment },
      create: { userId: req.user.id, productId: parseInt(productId), rating: parseInt(rating), comment },
      include: { user: { select: { name: true } } },
    });
    logger.info('reviews.create: success', { reviewId: review.id, productId, userId: req.user.id });
    return successResponse(res, review, 'Review saved', 201);
  } catch (error) {
    logger.error('reviews.create: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to save review', 500);
  }
};

const deleteReview = async (req, res) => {
  logger.info('reviews.delete', { reviewId: req.params.id, userId: req.user?.id });
  try {
    const review = await prisma.review.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!review) {
      logger.warn('reviews.delete: not found', { reviewId: req.params.id });
      return errorResponse(res, 'Review not found', 404);
    }
    if (req.user.role?.name !== 'admin' && review.userId !== req.user.id) {
      logger.warn('reviews.delete: forbidden', { reviewId: req.params.id, userId: req.user.id });
      return errorResponse(res, 'Forbidden', 403);
    }
    await prisma.review.delete({ where: { id: parseInt(req.params.id) } });
    logger.info('reviews.delete: success', { reviewId: req.params.id });
    return successResponse(res, null, 'Review deleted');
  } catch (error) {
    logger.error('reviews.delete: failed', { reviewId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to delete review', 500);
  }
};

module.exports = { getReviews, createReview, deleteReview };
