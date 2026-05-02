const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const getAll = async (req, res) => {
  logger.info('products.getAll', { query: req.query });
  try {
    const { page = 1, limit = 12, search = '', categoryId, minPrice, maxPrice } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
      ...(minPrice || maxPrice ? { price: { ...(minPrice && { gte: parseFloat(minPrice) }), ...(maxPrice && { lte: parseFloat(maxPrice) }) } } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip: parseInt(skip), take: parseInt(limit), include: { category: true }, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);

    logger.info('products.getAll: success', { total, page });
    return paginatedResponse(res, products, total, page, limit);
  } catch (error) {
    logger.error('products.getAll: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch products', 500);
  }
};

const getById = async (req, res) => {
  logger.info('products.getById', { productId: req.params.id });
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true },
    });
    if (!product) {
      logger.warn('products.getById: not found', { productId: req.params.id });
      return errorResponse(res, 'Product not found', 404);
    }
    return successResponse(res, product);
  } catch (error) {
    logger.error('products.getById: failed', { productId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch product', 500);
  }
};

const create = async (req, res) => {
  logger.info('products.create', { name: req.body.name, adminId: req.user?.id });
  try {
    const { name, description, price, stock, categoryId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await prisma.product.create({
      data: { name, description, price: parseFloat(price), stock: parseInt(stock), categoryId: parseInt(categoryId), imageUrl },
      include: { category: true },
    });
    logger.info('products.create: success', { productId: product.id, name });
    return successResponse(res, product, 'Product created', 201);
  } catch (error) {
    logger.error('products.create: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to create product', 500);
  }
};

const update = async (req, res) => {
  logger.info('products.update', { productId: req.params.id, adminId: req.user?.id });
  try {
    const { name, description, price, stock, categoryId, isActive } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const data = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price && { price: parseFloat(price) }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
      ...(isActive !== undefined && { isActive: isActive === 'true' || isActive === true }),
      ...(imageUrl && { imageUrl }),
    };

    const product = await prisma.product.update({ where: { id: parseInt(req.params.id) }, data, include: { category: true } });
    logger.info('products.update: success', { productId: product.id });
    return successResponse(res, product, 'Product updated');
  } catch (error) {
    logger.error('products.update: failed', { productId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to update product', 500);
  }
};

const remove = async (req, res) => {
  logger.info('products.remove', { productId: req.params.id, adminId: req.user?.id });
  try {
    const id = parseInt(req.params.id);
    await prisma.product.update({ where: { id }, data: { isActive: false } });
    logger.info('products.remove: success', { productId: id });
    return successResponse(res, null, 'Product deleted');
  } catch (error) {
    logger.error('products.remove: failed', { productId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to delete product', 500);
  }
};

module.exports = { getAll, getById, create, update, remove };
