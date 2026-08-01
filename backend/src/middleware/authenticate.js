const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { verifyAccessToken } = require('../utils/token');
const User = require('../models/User');

/**
 * Verifies the Bearer access token, loads the user (with populated role+permissions),
 * and attaches it to req.user. Throws 401 on any failure.
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw ApiError.unauthorized(
      err.name === 'TokenExpiredError' ? 'Access token expired' : 'Invalid access token'
    );
  }

  const user = await User.findById(decoded.sub).populate({
    path: 'role',
    populate: { path: 'permissions' },
  });

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User account is inactive or no longer exists');
  }

  req.user = user;
  req.tokenPayload = decoded;
  next();
});

module.exports = authenticate;
