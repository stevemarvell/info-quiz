import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { AppError } from '../middleware/errorHandler';

describe('Validation Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {};
    mockNext = jest.fn();
  });

  describe('validateBody', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      age: z.number().min(0)
    });

    it('should validate valid body and call next()', () => {
      mockReq.body = { name: 'John', age: 25 };

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.body).toEqual({ name: 'John', age: 25 });
    });

    it('should pass ZodError to next() for invalid body', () => {
      mockReq.body = { name: '', age: -1 };

      const middleware = validateBody(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ZodError);
    });

    it('should pass AppError to next() for non-Zod errors', () => {
      mockReq.body = { name: 'John', age: 25 };

      // Create a schema that throws a non-Zod error
      const badSchema = {
        parse: () => {
          throw new Error('Not a ZodError');
        }
      } as any;

      const middleware = validateBody(badSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid request body');
    });
  });

  describe('validateParams', () => {
    const testSchema = z.object({
      id: z.string().min(1)
    });

    it('should validate valid params and call next()', () => {
      mockReq.params = { id: 'test-123' };

      const middleware = validateParams(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.params).toEqual({ id: 'test-123' });
    });

    it('should pass ZodError to next() for invalid params', () => {
      mockReq.params = { id: '' };

      const middleware = validateParams(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ZodError);
    });

    it('should pass AppError to next() for non-Zod errors', () => {
      mockReq.params = { id: 'test' };

      const badSchema = {
        parse: () => {
          throw new Error('Not a ZodError');
        }
      } as any;

      const middleware = validateParams(badSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid request parameters');
    });
  });

  describe('validateQuery', () => {
    const testSchema = z.object({
      search: z.string().min(1),
      limit: z.string().regex(/^\d+$/)
    });

    it('should validate valid query and call next()', () => {
      mockReq.query = { search: 'test', limit: '10' };

      const middleware = validateQuery(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockReq.query).toEqual({ search: 'test', limit: '10' });
    });

    it('should pass ZodError to next() for invalid query', () => {
      mockReq.query = { search: '', limit: 'abc' };

      const middleware = validateQuery(testSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(ZodError);
    });

    it('should pass AppError to next() for non-Zod errors', () => {
      mockReq.query = { search: 'test', limit: '10' };

      const badSchema = {
        parse: () => {
          throw new Error('Not a ZodError');
        }
      } as any;

      const middleware = validateQuery(badSchema);
      middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = (mockNext as jest.Mock).mock.calls[0][0];
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid query parameters');
    });
  });
});
