const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { Transaction, Category } = require('../models');
const ApiError = require('../utils/ApiError');

const PAGE_SIZE = 20;

async function assertOwnedCategory(userId, categoryId) {
  const category = await Category.findOne({ where: { id: categoryId, user_id: userId } });
  if (!category) {
    throw new ApiError(400, 'CATEGORY_NOT_FOUND', 'Selected category was not found');
  }
  return category;
}

async function list(req, res, next) {
  try {
    const { start_date, end_date, type, category_id, payment_method } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);

    const where = { user_id: req.user.id };

    if (start_date || end_date) {
      where.date = {};
      if (start_date) where.date[Op.gte] = start_date;
      if (end_date) where.date[Op.lte] = end_date;
    }
    if (type) where.type = type;
    if (category_id) where.category_id = category_id;
    if (payment_method) where.payment_method = payment_method;

    const { rows, count } = await Transaction.findAndCountAll({
      where,
      include: [{ model: Category }],
      order: [
        ['date', 'DESC'],
        ['created_at', 'DESC'],
      ],
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });

    return res.json({
      transactions: rows,
      pagination: {
        page,
        page_size: PAGE_SIZE,
        total: count,
        total_pages: Math.max(Math.ceil(count / PAGE_SIZE), 1),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'VALIDATION_ERROR', errors.array()[0].msg));
    }

    const { type, amount, category_id, date, payment_method, description } = req.body;
    await assertOwnedCategory(req.user.id, category_id);

    const transaction = await Transaction.create({
      user_id: req.user.id,
      type,
      amount,
      category_id,
      date,
      payment_method,
      description: description || null,
    });

    const withCategory = await Transaction.findByPk(transaction.id, { include: [{ model: Category }] });
    return res.status(201).json({ transaction: withCategory });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'VALIDATION_ERROR', errors.array()[0].msg));
    }

    const transaction = await Transaction.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!transaction) {
      return next(new ApiError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found'));
    }

    const { type, amount, category_id, date, payment_method, description } = req.body;
    await assertOwnedCategory(req.user.id, category_id);

    transaction.type = type;
    transaction.amount = amount;
    transaction.category_id = category_id;
    transaction.date = date;
    transaction.payment_method = payment_method;
    transaction.description = description || null;
    await transaction.save();

    const withCategory = await Transaction.findByPk(transaction.id, { include: [{ model: Category }] });
    return res.json({ transaction: withCategory });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const transaction = await Transaction.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!transaction) {
      return next(new ApiError(404, 'TRANSACTION_NOT_FOUND', 'Transaction not found'));
    }
    await transaction.destroy();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };
