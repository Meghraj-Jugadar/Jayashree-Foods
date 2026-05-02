const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const getAll = async (req, res) => {
  logger.info('settings.getAll', { userId: req.user?.id });
  try {
    const settings = await prisma.settings.findMany();
    const map = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    logger.info('settings.getAll: success', { count: settings.length });
    return successResponse(res, map);
  } catch (error) {
    logger.error('settings.getAll: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch settings', 500);
  }
};

const update = async (req, res) => {
  logger.info('settings.update', { keys: Object.keys(req.body), adminId: req.user?.id });
  try {
    const updates = req.body;
    const results = [];

    for (const [key, value] of Object.entries(updates)) {
      const setting = await prisma.settings.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
      results.push(setting);
    }

    logger.info('settings.update: success', { updatedCount: results.length });
    return successResponse(res, results, 'Settings updated');
  } catch (error) {
    logger.error('settings.update: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to update settings', 500);
  }
};

module.exports = { getAll, update };
