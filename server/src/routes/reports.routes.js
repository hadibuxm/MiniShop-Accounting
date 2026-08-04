const express = require('express');
const { query } = require('express-validator');
const reportsController = require('../controllers/reports.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

const dailyValidators = [query('date').isISO8601().withMessage('A valid date is required')];
const monthlyValidators = [
  query('year').isInt({ min: 2000, max: 3000 }).withMessage('A valid year is required'),
  query('month').isInt({ min: 1, max: 12 }).withMessage('A valid month (1-12) is required'),
];
const rangeValidators = [
  query('start_date').isISO8601().withMessage('A valid start date is required'),
  query('end_date').isISO8601().withMessage('A valid end date is required'),
];

router.get('/daily', dailyValidators, reportsController.daily);
router.get('/monthly', monthlyValidators, reportsController.monthly);
router.get('/range', rangeValidators, reportsController.range);

router.get('/daily/pdf', dailyValidators, reportsController.dailyPdf);
router.get('/monthly/pdf', monthlyValidators, reportsController.monthlyPdf);
router.get('/range/pdf', rangeValidators, reportsController.rangePdf);

module.exports = router;
