// Standardized API Response Utility
import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiResponseUtil {
  /**
   * Send success response
   */
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Success',
    statusCode: number = 200
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send success response with pagination
   */
  static successPaginated<T>(
    res: Response,
    items: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
    },
    message: string = 'Success',
    statusCode: number = 200
  ): void {
    const totalPages = Math.ceil(pagination.total / pagination.limit);

    const response: ApiResponse<PaginatedResponse<T>> = {
      success: true,
      message,
      data: {
        items,
        pagination: {
          ...pagination,
          totalPages,
        },
      },
      statusCode,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send error response
   */
  static error(
    res: Response,
    error: string | Error,
    statusCode: number = 400,
    message?: string
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;

    const response: ApiResponse = {
      success: false,
      message: message || 'An error occurred',
      error: errorMessage,
      statusCode,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(statusCode).json(response);
  }

  /**
   * Send validation error response
   */
  static validationError(
    res: Response,
    errors: string[] | Record<string, string[]>,
    message: string = 'Validation failed'
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: 'Validation Error',
      data: { errors },
      statusCode: 400,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(400).json(response);
  }

  /**
   * Send not found response
   */
  static notFound(res: Response, resource: string = 'Resource'): void {
    const response: ApiResponse = {
      success: false,
      message: `${resource} not found`,
      error: 'Not Found',
      statusCode: 404,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(404).json(response);
  }

  /**
   * Send unauthorized response
   */
  static unauthorized(res: Response, message: string = 'Unauthorized'): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: 'Unauthorized',
      statusCode: 401,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(401).json(response);
  }

  /**
   * Send forbidden response
   */
  static forbidden(res: Response, message: string = 'Forbidden'): void {
    const response: ApiResponse = {
      success: false,
      message,
      error: 'Forbidden',
      statusCode: 403,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(403).json(response);
  }

  /**
   * Send created response
   */
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Resource created successfully'
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      statusCode: 201,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(201).json(response);
  }

  /**
   * Send no content response
   */
  static noContent(res: Response): void {
    res.status(204).send();
  }

  /**
   * Send server error response
   */
  static serverError(
    res: Response,
    error: string | Error,
    message: string = 'Internal server error'
  ): void {
    const errorMessage = error instanceof Error ? error.message : error;

    const response: ApiResponse = {
      success: false,
      message,
      error: errorMessage,
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: res.req.path,
    };

    res.status(500).json(response);
  }
}
