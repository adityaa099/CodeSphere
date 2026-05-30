const Redis = require('ioredis');

let redisClient = null;

const connectRedis = () => {
  if (redisClient) return redisClient;

  const redisOptions = {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    reconnectOnError(err) {
      console.error('Redis reconnect on error:', err.message);
      return true;
    }
  };

  if (process.env.REDIS_URL) {
    console.log('Connecting to Redis via REDIS_URL...');
    redisClient = new Redis(process.env.REDIS_URL, redisOptions);
  } else {
    console.log(`Connecting to Redis at ${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}...`);
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      ...redisOptions
    });
  }

  redisClient.on('connect', () => {
    console.log('✅ Redis connected');
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  return redisClient;
};

module.exports = connectRedis;
