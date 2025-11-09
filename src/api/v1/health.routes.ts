import { Router, Request, Response } from 'express';
import { AppDataSource } from '../../config/data-source';
import { redisClient, isRedisConnected } from '../../config/cache';
import { logger } from '../../config/logger';
import { ApiResponseUtil } from '../../utils/apiResponse';

const router = Router();

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'connected' | 'disconnected';
      responseTime?: number;
    };
    redis?: {
      status: 'connected' | 'disconnected';
      responseTime?: number;
    };
  };
}

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const healthStatus: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: {
        status: 'disconnected',
      },
    },
  };

  try {
    // Check database connection
    const dbStartTime = Date.now();
    if (AppDataSource.isInitialized) {
      // Try a simple query to verify connection
      await AppDataSource.query('SELECT 1');
      healthStatus.services.database = {
        status: 'connected',
        responseTime: Date.now() - dbStartTime,
      };
    } else {
      healthStatus.services.database.status = 'disconnected';
      healthStatus.status = 'unhealthy';
    }

    // Check Redis connection
    const redisStartTime = Date.now();
    try {
      if (isRedisConnected()) {
        await redisClient.ping();
        healthStatus.services.redis = {
          status: 'connected',
          responseTime: Date.now() - redisStartTime,
        };
      } else {
        healthStatus.services.redis = {
          status: 'disconnected',
        };
        // Redis is optional, so don't mark as unhealthy if only Redis is down
      }
    } catch (redisError) {
      healthStatus.services.redis = {
        status: 'disconnected',
      };
      logger.warn('Redis health check failed:', redisError);
    }

    // Determine overall health
    // Only mark as unhealthy if database is down (Redis is optional)
    if (healthStatus.services.database.status === 'disconnected') {
      healthStatus.status = 'unhealthy';
    }

        const totalResponseTime = Date.now() - startTime;
        const statusCode = healthStatus.status === 'healthy' ? 200 : 503;

        logger.debug(`Health check completed in ${totalResponseTime}ms`, {
          status: healthStatus.status,
          services: healthStatus.services,
        });

        if (statusCode === 200) {
          ApiResponseUtil.success(res, {
            ...healthStatus,
            responseTime: totalResponseTime,
          }, 'System is healthy');
        } else {
          ApiResponseUtil.error(res, 'System is unhealthy', statusCode, 'Health check failed');
        }
      } catch (error) {
        logger.error('Health check failed:', error);
        healthStatus.status = 'unhealthy';
        healthStatus.services.database.status = 'disconnected';

        ApiResponseUtil.serverError(res, error as Error, 'Health check failed');
      }
});

export default router;
