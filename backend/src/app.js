const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const logger = require('./config/logger');
require('./models'); // ensure every Mongoose model is registered before routes/populate() run
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { createRateLimiter } = require('./middleware/rateLimiter');
const ApiResponse = require('./utils/apiResponse');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(mongoSanitize());
app.use(xss());
app.use(compression());

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
const morganStream = { write: (message) => logger.http?.(message.trim()) || logger.info(message.trim()) };
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev', { stream: morganStream }));

// Global rate limiting
app.use(createRateLimiter());

// Health check
app.get('/health', (req, res) => {
  return ApiResponse.success(res, { message: 'Service healthy', data: { uptime: process.uptime() } });
});

// API docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use(env.apiPrefix, routes);

// 404 + error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
