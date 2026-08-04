const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof ApiError) {
    return res.status(err.status).json({ code: err.code, message: err.message });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ code: 'DUPLICATE_ENTRY', message: err.message });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: err.message });
  }

  console.error(err);
  return res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Something went wrong' });
}

module.exports = errorHandler;
