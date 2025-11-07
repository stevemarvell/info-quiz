import { Request, Response, NextFunction } from 'express';
import { sanitizeString, sanitizeObject, sanitizeInput } from '../middleware/sanitization';

describe('Sanitization Middleware', () => {
  describe('sanitizeString', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const output = sanitizeString(input);
      expect(output).not.toContain('<script>');
      expect(output).not.toContain('alert');
    });

    it('should remove event handlers', () => {
      const input = '<div onclick="malicious()">Click me</div>';
      const output = sanitizeString(input);
      expect(output).not.toContain('onclick');
      expect(output).not.toContain('malicious');
    });

    it('should remove javascript: protocol', () => {
      const input = '<a href="javascript:alert(1)">Click</a>';
      const output = sanitizeString(input);
      expect(output).not.toContain('javascript:');
    });

    it('should remove HTML tags', () => {
      const input = '<div>"Hello" & \'World\'</div>';
      const output = sanitizeString(input);
      // xss library strips HTML tags with our configuration
      expect(output).toBe('"Hello" & \'World\'');
      expect(output).not.toContain('<div>');
      expect(output).not.toContain('</div>');
    });

    it('should handle normal text without changes', () => {
      const input = 'Hello World 123';
      const output = sanitizeString(input);
      expect(output).toBe('Hello World 123');
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string values in an object', () => {
      const input = {
        title: '<script>alert("xss")</script>',
        description: 'Normal text',
        nested: {
          value: '<img src=x onerror="alert(1)">'
        }
      };

      const output = sanitizeObject(input);
      expect(output.title).not.toContain('<script>');
      expect(output.description).toBe('Normal text');
      expect(output.nested.value).not.toContain('onerror');
    });

    it('should sanitize arrays', () => {
      const input = {
        items: [
          '<script>alert(1)</script>',
          'Normal text',
          '<div onclick="bad()">Text</div>'
        ]
      };

      const output = sanitizeObject(input);
      output.items.forEach((item: string) => {
        expect(item).not.toContain('<script>');
        expect(item).not.toContain('onclick');
      });
    });

    it('should preserve numbers and booleans', () => {
      const input = {
        count: 42,
        isActive: true,
        score: 3.14
      };

      const output = sanitizeObject(input);
      expect(output.count).toBe(42);
      expect(output.isActive).toBe(true);
      expect(output.score).toBe(3.14);
    });

    it('should handle null and undefined', () => {
      const input = {
        nullValue: null,
        undefinedValue: undefined
      };

      const output = sanitizeObject(input);
      expect(output.nullValue).toBeNull();
      expect(output.undefinedValue).toBeUndefined();
    });
  });

  describe('sanitizeInput middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {};
      mockRes = {};
      mockNext = jest.fn();
    });

    it('should sanitize request body when present', () => {
      mockReq.body = {
        title: '<script>alert("xss")</script>',
        description: 'Normal text'
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.title).not.toContain('<script>');
      expect(mockReq.body.description).toBe('Normal text');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize request query when present', () => {
      mockReq.query = {
        search: '<script>alert("xss")</script>',
        filter: 'normal'
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.query.search).not.toContain('<script>');
      expect(mockReq.query.filter).toBe('normal');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize request params when present', () => {
      mockReq.params = {
        id: '<script>alert("xss")</script>',
        name: 'normal'
      };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.params.id).not.toContain('<script>');
      expect(mockReq.params.name).toBe('normal');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle request with no body, query, or params', () => {
      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should sanitize all three when all are present', () => {
      mockReq.body = { title: '<script>xss</script>' };
      mockReq.query = { search: '<script>xss</script>' };
      mockReq.params = { id: '<script>xss</script>' };

      sanitizeInput(mockReq as Request, mockRes as Response, mockNext);

      expect(mockReq.body.title).not.toContain('<script>');
      expect(mockReq.query.search).not.toContain('<script>');
      expect(mockReq.params.id).not.toContain('<script>');
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
