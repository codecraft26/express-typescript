/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the application and its dependencies (database, Redis)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *             example:
 *               status: healthy
 *               timestamp: "2025-11-09T14:30:00.000Z"
 *               uptime: 123.45
 *               services:
 *                 database:
 *                   status: connected
 *                   responseTime: 5
 *                 redis:
 *                   status: connected
 *                   responseTime: 2
 *               responseTime: 10
 *       503:
 *         description: Application is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *             example:
 *               status: unhealthy
 *               timestamp: "2025-11-09T14:30:00.000Z"
 *               uptime: 123.45
 *               services:
 *                 database:
 *                   status: disconnected
 *                 redis:
 *                   status: disconnected
 *               responseTime: 10
 *               error: "Health check failed"
 */

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint (API v1)
 *     description: Returns the health status of the application and its dependencies (database, Redis)
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *             example:
 *               status: healthy
 *               timestamp: "2025-11-09T14:30:00.000Z"
 *               uptime: 123.45
 *               services:
 *                 database:
 *                   status: connected
 *                   responseTime: 5
 *                 redis:
 *                   status: connected
 *                   responseTime: 2
 *               responseTime: 10
 *       503:
 *         description: Application is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthStatus'
 *             example:
 *               status: unhealthy
 *               timestamp: "2025-11-09T14:30:00.000Z"
 *               uptime: 123.45
 *               services:
 *                 database:
 *                   status: disconnected
 *                 redis:
 *                   status: disconnected
 *               responseTime: 10
 *               error: "Health check failed"
 */

