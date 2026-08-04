const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

function auth(req, res, next) {
  const token = req.cookies && req.cookies.token;

  if (!token) {
    return next(new ApiError(401, 'UNAUTHENTICATED', 'Authentication required'));
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    return next(new ApiError(401, 'UNAUTHENTICATED', 'Invalid or expired session'));
  }
}

module.exports = auth;
