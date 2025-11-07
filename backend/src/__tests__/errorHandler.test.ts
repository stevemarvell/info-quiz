import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { AppError, errorHandler, notFoundHandler, asyncHandler } from '../middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockReq = {
      path: '/test',
      method: 'GET',
      body: {}
    };

    mockRes = {
      status: statusMock,
      json: jsonMock
    };

    mockNext = jest.fn();

    // Save original NODE_ENV
    process.env.NODE_ENV = 'test';
  });

  describe('AppError class', () => {
    it('should create an AppError with statusCode and message', () => {
      const error = new AppError(400, 'Bad Request');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.name).toBe('AppError');
    });

    it('should create an AppError with details', () => {
      const details = { field: 'email', issue: 'invalid' };
      const error = new AppError(400, 'Validation failed', details);

      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.details).toEqual(details);
    });
  });

  describe('errorHandler', () => {
    it('should handle AppError without details', () => {
      const error = new AppError(404, 'Not found');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'AppError',
        message: 'Not found'
      });
    });

    it('should handle AppError with details in development', () => {
      process.env.NODE_ENV = 'development';
      const details = { field: 'email', message: 'Invalid email' };
      const error = new AppError(400, 'Validation failed', details);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'AppError',
        message: 'Validation failed',
        details: details
      });
    });

    it('should handle AppError with array details in development/test', () => {
      const details = [
        { field: 'email', message: 'Invalid email', internal: 'secret' },
        { path: 'password', message: 'Too short', secret: 'hidden' }
      ];
      const error = new AppError(400, 'Validation failed', details);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'AppError',
        message: 'Validation failed',
        details: details // In test mode, details are passed through unsanitized
      });
    });

    it('should handle AppError with object details in development/test', () => {
      const details = { secret: 'internal data', internal: 'stuff' };
      const error = new AppError(400, 'Error', details);

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'AppError',
        message: 'Error',
        details: details // In test mode, details are passed through
      });
    });

    it('should handle ZodError', () => {
      const schema = z.object({ email: z.string().email() });
      let zodError: ZodError;

      try {
        schema.parse({ email: 'invalid' });
      } catch (err) {
        zodError = err as ZodError;
      }

      errorHandler(zodError!, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'ValidationError',
        message: 'Request validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'email',
            message: expect.any(String)
          })
        ])
      });
    });

    it('should handle generic Error in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'InternalServerError',
        message: 'Something went wrong'
      });
    });

    it('should handle generic Error in test/development with error message', () => {
      const error = new Error('Internal database error');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'InternalServerError',
        message: 'Internal database error' // In test mode, error message is shown
      });
    });

    // Note: Production mode tests are not included because isProduction is evaluated
    // at module load time, so setting process.env.NODE_ENV in tests doesn't affect it.
    // Production error sanitization is tested through integration/E2E tests.
  });

  describe('notFoundHandler', () => {
    it('should return 404 with route information', () => {
      const req = { ...mockReq, path: '/nonexistent/path' } as Request;

      notFoundHandler(req, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: 'NotFound',
        message: 'Route /nonexistent/path not found'
      });
    });
  });

  describe('asyncHandler', () => {
    it('should call async function successfully', async () => {
      const asyncFn = jest.fn().mockResolvedValue(undefined);
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should catch async errors and pass to next', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const handler = asyncHandler(asyncFn);

      await handler(mockReq as Request, mockRes as Response, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
