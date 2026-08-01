const Redis = require('ioredis');
const env = require('./env');
const logger = require('./logger');

let client = null;

function getRedisClient() {
  if (client) return client;

  client = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password: env.redis.password,
    maxRetriesPerRequest: null,
    lazyConnect: env.isTest,
  });

  client.on('connect', () => logger.info('Redis connected'));
  client.on('error', (err) => logger.error(`Redis error: ${err.message}`));

  return client;
}

module.exports = { getRedisClient };
