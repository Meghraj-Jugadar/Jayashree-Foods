const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const getAllUsers = async (req, res) => {
  logger.info('users.getAll', { query: req.query, adminId: req.user?.id });
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } : {},
        role ? { role: { name: role } } : {},
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        select: {
          id: true, name: true, email: true, phone: true,
          address: true, isActive: true, createdAt: true,
          role: { select: { id: true, name: true } },
          addresses: {
            where: { isDefault: true },
            take: 1,
            select: { fullName: true, phone: true, line1: true, line2: true, city: true, state: true, pincode: true, label: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    logger.info('users.getAll: success', { total, page });
    return paginatedResponse(res, users, total, page, limit);
  } catch (error) {
    logger.error('users.getAll: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch users', 500);
  }
};

const getUserById = async (req, res) => {
  logger.info('users.getById', { targetUserId: req.params.id, requesterId: req.user?.id });
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true, name: true, email: true, phone: true,
        address: true, isActive: true, createdAt: true,
        role: { select: { id: true, name: true } },
        orders: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!user) {
      logger.warn('users.getById: not found', { userId: req.params.id });
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, user);
  } catch (error) {
    logger.error('users.getById: failed', { userId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch user', 500);
  }
};

const toggleUserStatus = async (req, res) => {
  logger.info('users.toggleStatus', { targetUserId: req.params.id, adminId: req.user?.id });
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) {
      logger.warn('users.toggleStatus: not found', { userId: req.params.id });
      return errorResponse(res, 'User not found', 404);
    }

    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { isActive: !user.isActive },
    });
    logger.info('users.toggleStatus: success', { userId: updated.id, isActive: updated.isActive });
    return successResponse(res, { isActive: updated.isActive }, `User ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (error) {
    logger.error('users.toggleStatus: failed', { userId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to update user status', 500);
  }
};

module.exports = { getAllUsers, getUserById, toggleUserStatus };
