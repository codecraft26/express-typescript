// Swagger/OpenAPI configuration
import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sugam Backend API',
      version: '1.0.0',
      description: 'RESTful API documentation for Sugam Backend Server',
      contact: {
        name: 'API Support',
        email: 'support@sugam.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3005/api/v1',
        description: 'Local server (Default)',
      },
      {
        url: `${config.APP_URL}/api/v1`,
        description: 'Development server',
      },
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Alternative server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        apiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
      schemas: {
        HealthStatus: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
              example: 'healthy',
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              example: '2025-11-09T14:30:00.000Z',
            },
            uptime: {
              type: 'number',
              description: 'Server uptime in seconds',
              example: 123.45,
            },
            services: {
              type: 'object',
              properties: {
                database: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['connected', 'disconnected'],
                      example: 'connected',
                    },
                    responseTime: {
                      type: 'number',
                      description: 'Response time in milliseconds',
                      example: 5,
                    },
                  },
                },
                redis: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      enum: ['connected', 'disconnected'],
                      example: 'connected',
                    },
                    responseTime: {
                      type: 'number',
                      description: 'Response time in milliseconds',
                      example: 2,
                    },
                  },
                },
              },
            },
            responseTime: {
              type: 'number',
              description: 'Total health check response time in milliseconds',
              example: 10,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Error message',
            },
            statusCode: {
              type: 'number',
              example: 400,
            },
            message: {
              type: 'string',
              example: 'Detailed error message',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Unauthorized - Invalid or missing authentication token',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
    ],
  },
  apis: [
    './src/api/**/swagger/*.swagger.ts',
    './src/core/**/swagger/*.swagger.ts',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

