const { PrismaClient } = require('@prisma/client');
const { successResponse, errorResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const getAddresses = async (req, res) => {
  logger.info('addresses.getAll', { userId: req.user?.id });
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    logger.info('addresses.getAll: success', { count: addresses.length, userId: req.user.id });
    return successResponse(res, addresses);
  } catch (error) {
    logger.error('addresses.getAll: failed', { userId: req.user?.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to fetch addresses', 500);
  }
};

const createAddress = async (req, res) => {
  logger.info('addresses.create', { userId: req.user?.id });
  try {
    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } = req.body;
    if (!fullName || !phone || !line1 || !city || !state || !pincode) {
      logger.warn('addresses.create: missing required fields', { userId: req.user?.id });
      return errorResponse(res, 'All required fields must be filled', 400);
    }

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }

    const count = await prisma.address.count({ where: { userId: req.user.id } });
    const address = await prisma.address.create({
      data: { userId: req.user.id, label: label || 'Home', fullName, phone, line1, line2, city, state, pincode, isDefault: isDefault || count === 0 },
    });
    logger.info('addresses.create: success', { addressId: address.id, userId: req.user.id });
    return successResponse(res, address, 'Address added', 201);
  } catch (error) {
    logger.error('addresses.create: failed', { userId: req.user?.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to create address', 500);
  }
};

const updateAddress = async (req, res) => {
  logger.info('addresses.update', { addressId: req.params.id, userId: req.user?.id });
  try {
    const { label, fullName, phone, line1, line2, city, state, pincode, isDefault } = req.body;
    const existing = await prisma.address.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing || existing.userId !== req.user.id) {
      logger.warn('addresses.update: not found or unauthorized', { addressId: req.params.id, userId: req.user?.id });
      return errorResponse(res, 'Address not found', 404);
    }

    if (isDefault) {
      await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    }

    const address = await prisma.address.update({
      where: { id: parseInt(req.params.id) },
      data: { label, fullName, phone, line1, line2, city, state, pincode, isDefault: isDefault || false },
    });
    logger.info('addresses.update: success', { addressId: address.id });
    return successResponse(res, address, 'Address updated');
  } catch (error) {
    logger.error('addresses.update: failed', { addressId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to update address', 500);
  }
};

const deleteAddress = async (req, res) => {
  logger.info('addresses.delete', { addressId: req.params.id, userId: req.user?.id });
  try {
    const existing = await prisma.address.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing || existing.userId !== req.user.id) {
      logger.warn('addresses.delete: not found or unauthorized', { addressId: req.params.id, userId: req.user?.id });
      return errorResponse(res, 'Address not found', 404);
    }
    await prisma.address.delete({ where: { id: parseInt(req.params.id) } });

    if (existing.isDefault) {
      const next = await prisma.address.findFirst({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } });
      if (next) {
        await prisma.address.update({ where: { id: next.id }, data: { isDefault: true } });
        logger.info('addresses.delete: reassigned default', { newDefaultId: next.id });
      }
    }

    logger.info('addresses.delete: success', { addressId: req.params.id });
    return successResponse(res, null, 'Address deleted');
  } catch (error) {
    logger.error('addresses.delete: failed', { addressId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to delete address', 500);
  }
};

const setDefault = async (req, res) => {
  logger.info('addresses.setDefault', { addressId: req.params.id, userId: req.user?.id });
  try {
    const existing = await prisma.address.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!existing || existing.userId !== req.user.id) {
      logger.warn('addresses.setDefault: not found or unauthorized', { addressId: req.params.id, userId: req.user?.id });
      return errorResponse(res, 'Address not found', 404);
    }
    await prisma.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    const address = await prisma.address.update({ where: { id: parseInt(req.params.id) }, data: { isDefault: true } });
    logger.info('addresses.setDefault: success', { addressId: address.id });
    return successResponse(res, address, 'Default address updated');
  } catch (error) {
    logger.error('addresses.setDefault: failed', { addressId: req.params.id, error: error.message, stack: error.stack });
    return errorResponse(res, 'Failed to set default address', 500);
  }
};

module.exports = { getAddresses, createAddress, updateAddress, deleteAddress, setDefault };
