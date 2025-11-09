// Redis client configuration
import Redis, { RedisOptions } from 'ioredis';
import { config } from './env';
import { logger } from './logger';

// Redis connection options
const redisOptions: RedisOptions = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD || undefined,
  retryStrategy: (times: number) => {
    // Exponential backoff: 50ms, 100ms, 200ms, 400ms, 800ms, 1600ms, max 3000ms
    const delay = Math.min(times * 50, 3000);
    logger.warn(`Redis connection retry attempt ${times}, waiting ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false, // Don't queue commands when offline
  connectTimeout: 10000, // 10 seconds
  lazyConnect: true, // Don't connect immediately
  // Connection pool settings
  family: 4, // Use IPv4
  keepAlive: 30000, // Keep connection alive
};

// Create Redis client instance
export const redisClient = new Redis(redisOptions);

// Redis connection event handlers
redisClient.on('connect', () => {
  logger.info('🔄 Redis client connecting...');
});

redisClient.on('ready', () => {
  logger.info('✅ Redis client connected and ready');
});

redisClient.on('error', (error: Error) => {
  logger.error('❌ Redis client error:', error);
});

redisClient.on('close', () => {
  logger.warn('⚠️ Redis client connection closed');
});

redisClient.on('reconnecting', (delay: number) => {
  logger.info(`🔄 Redis client reconnecting in ${delay}ms...`);
});

redisClient.on('end', () => {
  logger.warn('⚠️ Redis client connection ended');
});

// Initialize Redis connection
export const initializeRedis = async (): Promise<void> => {
  try {
    if (redisClient.status !== 'ready' && redisClient.status !== 'connecting') {
      await redisClient.connect();
      logger.info('✅ Redis connection established');
      
      // Test connection with a ping
      const pong = await redisClient.ping();
      if (pong === 'PONG') {
        logger.info('✅ Redis ping successful');
      }
    } else {
      logger.info('✅ Redis already connected');
    }
  } catch (error) {
    logger.error('❌ Error connecting to Redis:', error);
    throw error;
  }
};

// Close Redis connection gracefully
export const closeRedis = async (): Promise<void> => {
  try {
    if (redisClient.status !== 'end' && redisClient.status !== 'close') {
      await redisClient.quit();
      logger.info('✅ Redis connection closed');
    }
  } catch (error) {
    logger.error('❌ Error closing Redis connection:', error);
    // Force disconnect if quit fails
    redisClient.disconnect();
  }
};

// Helper function to check if Redis is connected
export const isRedisConnected = (): boolean => {
  return redisClient.status === 'ready';
};

// Export default Redis client
export default redisClient;
