const { createClient } = require('redis');
const logger = require('../utils/logger');

let client;

const getRedisClient = () => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      password: process.env.REDIS_PASSWORD || undefined,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) return new Error('Redis max retries reached');
          return Math.min(retries * 100, 3000);
        },
      },
    });

    client.on('connect', () => logger.info('✅ Redis connected'));
    client.on('error', (err) => logger.error(`Redis error: ${err.message}`));
    client.on('reconnecting', () => logger.warn('Redis reconnecting...'));

    client.connect().catch((err) => {
      logger.error(`Redis connection failed: ${err.message}`);
    });
  }
  return client;
};

module.exports = getRedisClient();
