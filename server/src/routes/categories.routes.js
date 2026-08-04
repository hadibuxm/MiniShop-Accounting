const express = require('express');
const { body } = require('express-validator');
const categoriesController = require('../controllers/categories.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', categoriesController.list);

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  ],
  categoriesController.create
);

router.put(
  '/:id',
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  categoriesController.update
);

router.delete('/:id', categoriesController.remove);

module.exports = router;
