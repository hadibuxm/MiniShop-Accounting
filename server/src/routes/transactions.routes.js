const express = require('express');
const { body } = require('express-validator');
const transactionsController = require('../controllers/transactions.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

const transactionValidators = [
  body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('Amount must be a positive number'),
  body('category_id').notEmpty().withMessage('Category is required'),
  body('date')
    .isISO8601()
    .withMessage('A valid date is required')
    .custom((value) => {
      const today = new Date().toISOString().slice(0, 10);
      if (value.slice(0, 10) > today) {
        throw new Error('Date cannot be in the future');
      }
      return true;
    }),
  body('payment_method')
    .isIn(['cash', 'bank_transfer', 'jazzcash', 'easypaisa'])
    .withMessage('Invalid payment method'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 255 }).withMessage('Description is too long'),
];

router.get('/', transactionsController.list);
router.post('/', transactionValidators, transactionsController.create);
router.put('/:id', transactionValidators, transactionsController.update);
router.delete('/:id', transactionsController.remove);

module.exports = router;
