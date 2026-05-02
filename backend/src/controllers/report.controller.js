const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const getSalesReport = async (req, res) => {
  logger.info('reports.getSales', { query: req.query, adminId: req.user?.id });
  try {
    const { startDate, endDate } = req.query;

    const where = {
      status: 'COMPLETED',
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(new Date(endDate).setHours(23, 59, 59)) }),
        },
      } : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderItems: { include: { product: { include: { category: true } } } },
        user: { select: { name: true, email: true } },
        payment: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const totalTax = orders.reduce((sum, o) => sum + parseFloat(o.taxAmount), 0);
    const totalOrders = orders.length;

    const productMap = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        const key = item.product.name;
        if (!productMap[key]) productMap[key] = { name: key, quantity: 0, revenue: 0 };
        productMap[key].quantity += item.quantity;
        productMap[key].revenue += parseFloat(item.subtotal);
      });
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    logger.info('reports.getSales: success', { totalOrders, totalRevenue });
    return successResponse(res, { totalRevenue, totalTax, totalOrders, topProducts, orders });
  } catch (error) {
    logger.error('reports.getSales: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to generate report', 500);
  }
};

const exportCSV = async (req, res) => {
  logger.info('reports.exportCSV', { query: req.query, adminId: req.user?.id });
  try {
    const { startDate, endDate } = req.query;

    const where = {
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(new Date(endDate).setHours(23, 59, 59)) }),
        },
      } : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      include: { user: { select: { name: true, email: true } }, payment: true },
      orderBy: { createdAt: 'desc' },
    });

    const headers = ['Order Number', 'Customer', 'Email', 'Status', 'Total Amount', 'Tax', 'Payment Status', 'Date'];
    const rows = orders.map(o => [
      o.orderNumber,
      o.user.name,
      o.user.email,
      o.status,
      parseFloat(o.totalAmount).toFixed(2),
      parseFloat(o.taxAmount).toFixed(2),
      o.payment?.status || 'N/A',
      new Date(o.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    logger.info('reports.exportCSV: success', { rowCount: rows.length });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=sales-report-${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    logger.error('reports.exportCSV: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to export CSV', 500);
  }
};

module.exports = { getSalesReport, exportCSV };
