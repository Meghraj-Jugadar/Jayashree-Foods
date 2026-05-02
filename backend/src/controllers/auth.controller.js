const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt.utils');
const { successResponse, errorResponse } = require('../utils/response.utils');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const register = async (req, res) => {
  logger.info('register: attempt', { email: req.body.email });
  try {
    const { name, email, password, phone, address } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      logger.warn('register: email already registered', { email });
      return errorResponse(res, 'Email already registered', 409);
    }

    const customerRole = await prisma.role.findUnique({ where: { name: 'customer' } });
    if (!customerRole) {
      logger.error('register: customer role not found');
      return errorResponse(res, 'Role not configured', 500);
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, phone, address, roleId: customerRole.id },
      include: { role: true },
    });

    const token = generateToken(user.id, user.role.name);
    const { password: _, ...userWithoutPassword } = user;

    logger.info('register: success', { userId: user.id, email });
    return successResponse(res, { user: userWithoutPassword, token }, 'Registration successful', 201);
  } catch (error) {
    logger.error('register: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Registration failed', 500);
  }
};

const login = async (req, res) => {
  logger.info('login: attempt', { identifier: req.body.identifier });
  try {
    const { identifier, password } = req.body;

    const clean = identifier.trim();
    const isPhone = /^[+\d][\d\s\-]{6,}$/.test(clean) && !clean.includes('@');
    const user = await prisma.user.findFirst({
      where: isPhone ? { phone: clean } : { email: clean.toLowerCase() },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      logger.warn('login: invalid credentials or inactive user', { identifier: clean });
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn('login: password mismatch', { userId: user.id });
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user.id, user.role.name);
    const { password: _, ...userWithoutPassword } = user;

    logger.info('login: success', { userId: user.id, role: user.role.name });
    return successResponse(res, { user: userWithoutPassword, token }, 'Login successful');
  } catch (error) {
    logger.error('login: failed', { error: error.message, stack: error.stack });
    return errorResponse(res, 'Login failed', 500);
  }
};

const getProfile = async (req, res) => {
  logger.info('getProfile', { userId: req.user.id });
  try {
    const { password: _, ...user } = req.user;
    return successResponse(res, user);
  } catch (error) {
    logger.error('getProfile: failed', { userId: req.user?.id, error: error.message });
    return errorResponse(res, 'Failed to fetch profile', 500);
  }
};

const updateProfile = async (req, res) => {
  logger.info('updateProfile', { userId: req.user.id });
  try {
    const { name, phone, address } = req.body;
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone, address },
      include: { role: true },
    });
    const { password: _, ...user } = updated;
    logger.info('updateProfile: success', { userId: req.user.id });
    return successResponse(res, user, 'Profile updated');
  } catch (error) {
    logger.error('updateProfile: failed', { userId: req.user?.id, error: error.message });
    return errorResponse(res, 'Failed to update profile', 500);
  }
};

const changePassword = async (req, res) => {
  logger.info('changePassword', { userId: req.user.id });
  try {
    const { currentPassword, newPassword } = req.body;
    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      logger.warn('changePassword: current password incorrect', { userId: req.user.id });
      return errorResponse(res, 'Current password is incorrect', 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    logger.info('changePassword: success', { userId: req.user.id });
    return successResponse(res, null, 'Password changed successfully');
  } catch (error) {
    logger.error('changePassword: failed', { userId: req.user?.id, error: error.message });
    return errorResponse(res, 'Failed to change password', 500);
  }
};

module.exports = { register, login, getProfile, updateProfile, changePassword };
