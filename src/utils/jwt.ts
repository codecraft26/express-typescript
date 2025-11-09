// JWT utilities
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { logger } from '../config/logger';

export interface JwtPayload {
  id: string;
  email: string;
  type: 'platform_admin' | 'super_admin' | 'admin' | 'user';
  tenant_id?: string | null;
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JwtPayload): string {
  try {
    const secret: string = config.JWT_SECRET;
    
    const token = jwt.sign(
      payload,
      secret,
      {
        expiresIn: config.JWT_EXPIRES_IN,
        issuer: config.APP_NAME,
      } as SignOptions
    );
    return token;
  } catch (error) {
    logger.error('Error generating JWT token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const secret: string = config.JWT_SECRET;
    const decoded = jwt.verify(token, secret, {
      issuer: config.APP_NAME,
    }) as JwtPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    logger.error('Error verifying JWT token:', error);
    throw new Error('Failed to verify authentication token');
  }
}

/**
 * Decode JWT token without verification (for debugging)
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    return jwt.decode(token) as JwtPayload | null;
  } catch (error) {
    logger.error('Error decoding JWT token:', error);
    return null;
  }
}
