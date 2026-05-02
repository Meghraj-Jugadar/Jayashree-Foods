const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const getAll = async (req, res) => {
  logger.info('categories.getAll');
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    logger.info('categories.getAll: success', { count: categories.length });
    return successResponse(res, categories);
  } catch (error) {
    logger.error('categories.getAll: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch categories', 500);
  }
};

const create = async (req, res) => {
  logger.info('categories.create', { name: req.body.name, adminId: req.user?.id });
  try {
    const { name, description } = req.body;
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      logger.warn('categories.create: already exists', { name });
      return errorResponse(res, 'Category already exists', 409);
    }

    const category = await prisma.category.create({ data: { name, description } });
    logger.info('categories.create: success', { categoryId: category.id, name });
    return successResponse(res, category, 'Category created', 201);
  } catch (error) {
    logger.error('categories.create: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to create category', 500);
  }
};

const update = async (req, res) => {
  logger.info('categories.update', { categoryId: req.params.id, adminId: req.user?.id });
  try {
    const { name, description, isActive } = req.body;
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, isActive },
    });
    logger.info('categories.update: success', { categoryId: category.id });
    return successResponse(res, category, 'Category updated');
  } catch (error) {
    logger.error('categories.update: failed', { categoryId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to update category', 500);
  }
};

const remove = async (req, res) => {
  logger.info('categories.remove', { categoryId: req.params.id, adminId: req.user?.id });
  try {
    const id = parseInt(req.params.id);
    const hasProducts = await prisma.product.count({ where: { categoryId: id } });
    if (hasProducts > 0) {
      logger.warn('categories.remove: has products, cannot delete', { categoryId: id, productCount: hasProducts });
      return errorResponse(res, 'Cannot delete category with products', 400);
    }

    await prisma.category.delete({ where: { id } });
    logger.info('categories.remove: success', { categoryId: id });
    return successResponse(res, null, 'Category deleted');
  } catch (error) {
    logger.error('categories.remove: failed', { categoryId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to delete category', 500);
  }
};

module.exports = { getAll, create, update, remove };
