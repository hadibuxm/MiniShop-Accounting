const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const { signToken } = require('../utils/jwt');
const { seedDefaultCategories } = require('../services/seedCategories.service');
const ApiError = require('../utils/ApiError');

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE_MS,
  };
}

function toPublicUser(user) {
  return {
    id: user.id,
    full_name: user.full_name,
    shop_name: user.shop_name,
    email: user.email,
    language_preference: user.language_preference,
  };
}

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'VALIDATION_ERROR', errors.array()[0].msg));
    }

    const { full_name, shop_name, email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return next(new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists'));
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ full_name, shop_name, email, password_hash });
    await seedDefaultCategories(user.id);

    const token = signToken({ sub: user.id, email: user.email });
    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'VALIDATION_ERROR', errors.array()[0].msg));
    }

    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'));
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return next(new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'));
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.cookie(COOKIE_NAME, token, cookieOptions());

    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
}

async function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  return res.status(204).send();
}

async function me(req, res, next) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return next(new ApiError(401, 'UNAUTHENTICATED', 'Session no longer valid'));
    }
    return res.json({ user: toPublicUser(user) });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login, logout, me };
