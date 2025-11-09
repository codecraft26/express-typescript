// JWT validation middleware
import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { ApiResponseUtil } from '../utils/apiResponse';
import { logger } from '../config/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT token
 */
export function authenticate(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      ApiResponseUtil.unauthorized(res, 'Authorization header is required');
      return;
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      ApiResponseUtil.unauthorized(res, 'Invalid authorization header format. Use: Bearer <token>');
      return;
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);
    
    // Attach user info to request
    req.user = decoded;
    
    next();
  } catch (error: any) {
    logger.warn('Authentication failed:', error.message);
    ApiResponseUtil.unauthorized(res, error.message || 'Invalid or expired token');
  }
}

/**
 * Middleware to check if user is a platform admin
 */
export function requirePlatformAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    ApiResponseUtil.unauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.type !== 'platform_admin') {
    ApiResponseUtil.forbidden(res, 'Platform admin access required');
    return;
  }

  next();
}

/**
 * Middleware to check if user is a super admin (tenant level)
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    ApiResponseUtil.unauthorized(res, 'Authentication required');
    return;
  }

  if (req.user.type !== 'super_admin' && req.user.type !== 'platform_admin') {
    ApiResponseUtil.forbidden(res, 'Super admin access required');
    return;
  }

  next();
}

/**
 * Middleware to check if user is an admin (any level)
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    ApiResponseUtil.unauthorized(res, 'Authentication required');
    return;
  }

  const adminTypes = ['platform_admin', 'super_admin', 'admin'];
  if (!adminTypes.includes(req.user.type)) {
    ApiResponseUtil.forbidden(res, 'Admin access required');
    return;
  }

  next();
}
