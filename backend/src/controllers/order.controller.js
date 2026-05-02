const { PrismaClient } = require('@prisma/client');
const { generateOrderNumber } = require('../utils/jwt.utils');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const createOrder = async (req, res) => {
  logger.info('createOrder: attempt', { userId: req.user.id });
  try {
    const { items, notes, addressId } = req.body;
    const userId = req.user.id;

    let deliveryAddress = null;
    if (addressId) {
      const addr = await prisma.address.findUnique({ where: { id: parseInt(addressId) } });
      if (addr && addr.userId === userId) {
        deliveryAddress = `${addr.fullName}, ${addr.phone}, ${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
      }
    }
    if (!deliveryAddress) {
      logger.warn('createOrder: no valid delivery address', { userId, addressId });
      return errorResponse(res, 'Please select a delivery address', 400);
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.isActive) {
        logger.warn('createOrder: product not available', { productId: item.productId });
        return errorResponse(res, `Product ${item.productId} not available`, 400);
      }
      if (product.stock < item.quantity) {
        logger.warn('createOrder: insufficient stock', { productId: item.productId, stock: product.stock, requested: item.quantity });
        return errorResponse(res, `Insufficient stock for ${product.name}`, 400);
      }

      const subtotal = parseFloat(product.price) * item.quantity;
      totalAmount += subtotal;
      orderItems.push({ productId: item.productId, quantity: item.quantity, unitPrice: product.price, subtotal });
    }

    const taxSetting = await prisma.settings.findUnique({ where: { key: 'tax_rate' } });
    const taxRate = taxSetting ? parseFloat(taxSetting.value) / 100 : 0.18;
    const taxAmount = totalAmount * taxRate;

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          totalAmount: totalAmount + taxAmount,
          taxAmount,
          notes,
          deliveryAddress,
          orderItems: { create: orderItems },
        },
        include: { orderItems: { include: { product: true } }, user: { select: { id: true, name: true, email: true } } },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    logger.info('createOrder: success', { orderId: order.id, orderNumber: order.orderNumber, userId });
    return successResponse(res, order, 'Order placed successfully', 201);
  } catch (error) {
    logger.error('createOrder: failed', { userId: req.user?.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to create order', 500);
  }
};

const getAllOrders = async (req, res) => {
  const isAdmin = req.user.role.name === 'admin';
  logger.info('getAllOrders', { userId: req.user.id, isAdmin, query: req.query });
  try {
    const { page = 1, limit = 10, status, search, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      ...(!isAdmin && { userId: req.user.id }),
      ...(status && { status }),
      ...(search && { orderNumber: { contains: search, mode: 'insensitive' } }),
      ...(startDate || endDate ? { createdAt: { ...(startDate && { gte: new Date(startDate) }), ...(endDate && { lte: new Date(endDate) }) } } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: parseInt(skip),
        take: parseInt(limit),
        include: {
          user: { select: { id: true, name: true, email: true } },
          orderItems: { include: { product: { select: { id: true, name: true } } } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    logger.info('getAllOrders: success', { total, page, userId: req.user.id });
    return paginatedResponse(res, orders, total, page, limit);
  } catch (error) {
    logger.error('getAllOrders: failed', { userId: req.user?.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch orders', 500);
  }
};

const getOrderById = async (req, res) => {
  logger.info('getOrderById', { orderId: req.params.id, userId: req.user.id });
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, address: true } },
        orderItems: { include: { product: { include: { category: true } } } },
        payment: true,
      },
    });

    if (!order) {
      logger.warn('getOrderById: not found', { orderId: req.params.id });
      return errorResponse(res, 'Order not found', 404);
    }
    if (req.user.role.name !== 'admin' && order.userId !== req.user.id) {
      logger.warn('getOrderById: access denied', { orderId: req.params.id, userId: req.user.id });
      return errorResponse(res, 'Access denied', 403);
    }

    return successResponse(res, order);
  } catch (error) {
    logger.error('getOrderById: failed', { orderId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch order', 500);
  }
};

const updateOrderStatus = async (req, res) => {
  logger.info('updateOrderStatus', { orderId: req.params.id, status: req.body.status, adminId: req.user.id });
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      logger.warn('updateOrderStatus: invalid status', { status });
      return errorResponse(res, 'Invalid status', 400);
    }

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    logger.info('updateOrderStatus: success', { orderId: order.id, status });
    return successResponse(res, order, 'Order status updated');
  } catch (error) {
    logger.error('updateOrderStatus: failed', { orderId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to update order status', 500);
  }
};

const getDashboardStats = async (req, res) => {
  logger.info('getDashboardStats', { adminId: req.user.id });
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));

    const [totalOrders, totalRevenue, monthlyOrders, dailyOrders, recentOrders, ordersByStatus] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: 'COMPLETED' } }),
      prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.order.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      prisma.order.groupBy({ by: ['status'], _count: { id: true } }),
    ]);

    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      const start = new Date(d.getFullYear(), d.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() - i + 1, 0);
      const result = await prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
      });
      monthlyRevenue.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: parseFloat(result._sum.totalAmount || 0),
      });
    }

    logger.info('getDashboardStats: success', { totalOrders, dailyOrders });
    return successResponse(res, {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue._sum.totalAmount || 0),
      monthlyOrders,
      dailyOrders,
      recentOrders,
      ordersByStatus,
      monthlyRevenue,
    });
  } catch (error) {
    logger.error('getDashboardStats: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch dashboard stats', 500);
  }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrderStatus, getDashboardStats };
