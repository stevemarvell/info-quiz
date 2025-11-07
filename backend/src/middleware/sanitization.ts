import { Request, Response, NextFunction } from 'express';
import xss from 'xss';

/**
 * Sanitize string to prevent XSS attacks
 * Uses the xss library for robust, battle-tested XSS prevention
 */
export const sanitizeString = (value: string): string => {
  if (typeof value !== 'string') return value;

  // Use xss library with strict options
  return xss(value, {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true, // Remove all HTML tags
    stripIgnoreTagBody: ['script'], // Remove script tags and content
  });
};

/**
 * Recursively sanitize all string values in an object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitized: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Middleware to sanitize request body, query, and params
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};
