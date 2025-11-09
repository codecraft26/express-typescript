// Cache loader - initializes Redis connection
import { initializeRedis } from '../config/cache';
import { logger } from '../config/logger';

export const loadCache = async (): Promise<void> => {
  try {
    await initializeRedis();
    logger.info('✅ Cache (Redis) loaded successfully');
  } catch (error) {
    logger.error('❌ Failed to load cache (Redis):', error);
    // Don't throw - allow server to start without Redis in development
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      logger.warn('⚠️ Continuing without Redis cache (development mode)');
    }
  }
};
