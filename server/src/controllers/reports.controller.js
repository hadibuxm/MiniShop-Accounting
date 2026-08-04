const { validationResult } = require('express-validator');
const { User } = require('../models');
const { buildReport } = require('../services/reports.service');
const { buildReportPdf } = require('../services/pdfReport.service');
const ApiError = require('../utils/ApiError');

function monthBounds(year, month) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

async function daily(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'VALIDATION_ERROR', errors.array()[0].msg));
    }
    const { date } = req.query;
    const report = await buildReport(req.user.id, date, date);
    return res.json({ report });
  } catch (err) {
    return next(err);
  }
}

async function monthly(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'VALIDATION_ERROR', errors.array()[0].msg));
    }
    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);
    const { start, end } = monthBounds(year, month);
    const report = await buildReport(req.user.id, start, end);
    return res.json({ report });
  } catch (err) {
    return next(err);
  }
}

async function range(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ApiError(400, 'VALIDATION_ERROR', errors.array()[0].msg));
    }
    const { start_date, end_date } = req.query;
    if (end_date < start_date) {
      return next(new ApiError(400, 'INVALID_DATE_RANGE', 'End date must not be before start date'));
    }
    const report = await buildReport(req.user.id, start_date, end_date);
    return res.json({ report });
  } catch (err) {
    return next(err);
  }
}

async function sendReportPdf(req, res, next, { startDate, endDate, title }) {
  try {
    const user = await User.findByPk(req.user.id);
    const report = await buildReport(req.user.id, startDate, endDate);
    const pdfDoc = buildReportPdf({ shopName: user.shop_name, title, startDate, endDate, report });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title.replace(/\s+/g, '_')}.pdf"`);
    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (err) {
    next(err);
  }
}

async function dailyPdf(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'VALIDATION_ERROR', errors.array()[0].msg));
  }
  const { date } = req.query;
  return sendReportPdf(req, res, next, { startDate: date, endDate: date, title: 'Daily Summary Report' });
}

async function monthlyPdf(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'VALIDATION_ERROR', errors.array()[0].msg));
  }
  const year = parseInt(req.query.year, 10);
  const month = parseInt(req.query.month, 10);
  const { start, end } = monthBounds(year, month);
  return sendReportPdf(req, res, next, { startDate: start, endDate: end, title: 'Monthly Profit & Loss Report' });
}

async function rangePdf(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'VALIDATION_ERROR', errors.array()[0].msg));
  }
  const { start_date, end_date } = req.query;
  if (end_date < start_date) {
    return next(new ApiError(400, 'INVALID_DATE_RANGE', 'End date must not be before start date'));
  }
  return sendReportPdf(req, res, next, {
    startDate: start_date,
    endDate: end_date,
    title: 'Custom Date Range Report',
  });
}

module.exports = { daily, monthly, range, dailyPdf, monthlyPdf, rangePdf };
