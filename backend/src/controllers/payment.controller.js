const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const processPayment = async (req, res) => {
  logger.info('payments.process: attempt', { orderId: req.body.orderId, userId: req.user?.id });
  try {
    const { orderId, method = 'SIMULATED' } = req.body;

    const order = await prisma.order.findUnique({ where: { id: parseInt(orderId) } });
    if (!order) {
      logger.warn('payments.process: order not found', { orderId });
      return errorResponse(res, 'Order not found', 404);
    }
    if (order.userId !== req.user.id && req.user.role.name !== 'admin') {
      logger.warn('payments.process: access denied', { orderId, userId: req.user.id });
      return errorResponse(res, 'Access denied', 403);
    }

    const existingPayment = await prisma.payment.findUnique({ where: { orderId: parseInt(orderId) } });
    if (existingPayment && existingPayment.status === 'COMPLETED') {
      logger.warn('payments.process: already completed', { orderId });
      return errorResponse(res, 'Payment already completed', 400);
    }

    const isSuccess = Math.random() > 0.05;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.upsert({
        where: { orderId: parseInt(orderId) },
        update: { status: isSuccess ? 'COMPLETED' : 'FAILED', transactionId, method },
        create: {
          orderId: parseInt(orderId),
          userId: req.user.id,
          amount: order.totalAmount,
          method,
          status: isSuccess ? 'COMPLETED' : 'FAILED',
          transactionId,
        },
      });

      if (isSuccess) {
        await tx.order.update({ where: { id: parseInt(orderId) }, data: { status: 'PROCESSING' } });
      }

      return p;
    });

    if (isSuccess) {
      logger.info('payments.process: success', { orderId, transactionId, method });
    } else {
      logger.warn('payments.process: payment failed (simulated)', { orderId, transactionId });
    }

    return successResponse(res, payment, isSuccess ? 'Payment successful' : 'Payment failed');
  } catch (error) {
    logger.error('payments.process: error', { orderId: req.body?.orderId, error: error.message, stack: error.stack });
    return errorResponse(res, 'Payment processing failed', 500);
  }
};

const getPaymentByOrder = async (req, res) => {
  logger.info('payments.getByOrder', { orderId: req.params.orderId, userId: req.user?.id });
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId: parseInt(req.params.orderId) },
      include: { order: true },
    });
    if (!payment) {
      logger.warn('payments.getByOrder: not found', { orderId: req.params.orderId });
      return errorResponse(res, 'Payment not found', 404);
    }
    return successResponse(res, payment);
  } catch (error) {
    logger.error('payments.getByOrder: failed', { orderId: req.params.orderId, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch payment', 500);
  }
};

module.exports = { processPayment, getPaymentByOrder };
