const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const auditLogger = require('../middleware/auditLogger');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  register,
  login,
  refresh,
  changePassword,
  forgotPassword,
  resetPassword,
} = require('../validators/authValidators');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and session management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/register', authLimiter, validate(register), auditLogger('AUTH', 'USER_REGISTER'), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful, returns access + refresh tokens
 */
router.post('/login', authLimiter, validate(login), auditLogger('AUTH', 'USER_LOGIN'), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Rotate refresh token and issue a new access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New token pair issued
 */
router.post('/refresh', validate(refresh), authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Revoke the current refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authenticate, auditLogger('AUTH', 'USER_LOGOUT'), authController.logout);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change password for the authenticated user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Password changed
 */
router.post(
  '/change-password',
  authenticate,
  validate(changePassword),
  auditLogger('AUTH', 'PASSWORD_CHANGE'),
  authController.changePassword
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Reset email sent if the account exists
 */
router.post(
  '/forgot-password',
  authLimiter,
  validate(forgotPassword),
  auditLogger('AUTH', 'PASSWORD_FORGOT'),
  authController.forgotPassword
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using a valid reset token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password reset
 */
router.post(
  '/reset-password',
  authLimiter,
  validate(resetPassword),
  auditLogger('AUTH', 'PASSWORD_RESET'),
  authController.resetPassword
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Current user
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
