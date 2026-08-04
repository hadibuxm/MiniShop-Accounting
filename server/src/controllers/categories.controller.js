const { validationResult } = require('express-validator');
const { Category, Transaction } = require('../models');
const ApiError = require('../utils/ApiError');

async function list(req, res, next) {
  try {
    const categories = await Category.findAll({
      where: { user_id: req.user.id },
      order: [
        ['type', 'ASC'],
        ['name', 'ASC'],
      ],
    });
    return res.json({ categories });
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

    const { name, type } = req.body;
    const existing = await Category.findOne({ where: { user_id: req.user.id, name, type } });
    if (existing) {
      return next(new ApiError(409, 'CATEGORY_DUPLICATE', 'A category with this name and type already exists'));
    }

    const category = await Category.create({ user_id: req.user.id, name, type, is_default: false });
    return res.status(201).json({ category });
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

    const category = await Category.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!category) {
      return next(new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found'));
    }

    const { name } = req.body;
    const existing = await Category.findOne({
      where: { user_id: req.user.id, name, type: category.type },
    });
    if (existing && existing.id !== category.id) {
      return next(new ApiError(409, 'CATEGORY_DUPLICATE', 'A category with this name and type already exists'));
    }

    category.name = name;
    await category.save();
    return res.json({ category });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    const category = await Category.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!category) {
      return next(new ApiError(404, 'CATEGORY_NOT_FOUND', 'Category not found'));
    }

    const linkedCount = await Transaction.count({ where: { category_id: category.id } });
    if (linkedCount > 0) {
      return next(
        new ApiError(409, 'CATEGORY_HAS_TRANSACTIONS', 'Cannot delete a category that has linked transactions')
      );
    }

    await category.destroy();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, create, update, remove };
