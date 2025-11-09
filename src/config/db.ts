// TypeORM Database connection setup
import { AppDataSource } from './data-source';
import { logger } from './logger';

export const initializeDatabase = async (): Promise<void> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('✅ Database connection established');
      // Log pool information if available
      try {
        const driver = AppDataSource.driver as any;
        const pool = driver?.master;
        if (pool) {
          const poolSize = pool.totalCount || 'unknown';
          logger.info(`📊 Connection pool initialized (size: ${poolSize})`);
        }
      } catch (poolError) {
        // Ignore pool info errors, not critical
      }
    }
  } catch (error) {
    logger.error('❌ Error connecting to database:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      logger.info('✅ Database connection closed');
    }
  } catch (error) {
    logger.error('❌ Error closing database connection:', error);
    throw error;
  }
};

export { AppDataSource };
