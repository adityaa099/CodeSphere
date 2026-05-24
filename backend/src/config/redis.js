const Redis = require('ioredis');

let redisClient = null;

const connectRedis = () => {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      console.error('Redis reconnect on error:', err.message);
      return true;
    }
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  return redisClient;
};

module.exports = connectRedis;
