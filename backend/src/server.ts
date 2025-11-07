import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createRouter } from './routes';
import { InMemoryQuizRepository } from './repositories/InMemoryQuizRepository';
import { InMemoryQuizResponseRepository } from './repositories/InMemoryQuizResponseRepository';
import { QuizService } from './services/QuizService';
import { initializeSampleData } from './sampleData';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { sanitizeInput } from './middleware/sanitization';
import { logger } from './utils/logger';
import { env } from './config/env';
import { RATE_LIMITS, TIMEOUTS, REQUEST_LIMITS } from './config/constants';

const app = express();
const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));

// Tiered Rate Limiting (Issue 7)
// General rate limit - more permissive for reads
const generalLimiter = rateLimit({
  windowMs: RATE_LIMITS.WINDOW_MS,
  max: RATE_LIMITS.MAX_REQUESTS_GENERAL,
  message: { success: false, error: 'TooManyRequests', message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limit for write operations (POST, PUT, DELETE)
const writeLimiter = rateLimit({
  windowMs: RATE_LIMITS.WINDOW_MS,
  max: RATE_LIMITS.MAX_REQUESTS_WRITE,
  message: { success: false, error: 'TooManyRequests', message: 'Too many write requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET', // Only apply to non-GET requests
});

// Health check rate limiter - more permissive for monitoring systems
const healthLimiter = rateLimit({
  windowMs: RATE_LIMITS.WINDOW_MS,
  max: RATE_LIMITS.MAX_REQUESTS_GENERAL * 2, // 200 requests per 15 minutes
  message: { success: false, error: 'TooManyRequests', message: 'Too many health check requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', generalLimiter);
app.use('/api', writeLimiter);

// Body parsing
app.use(express.json({ limit: REQUEST_LIMITS.JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_LIMITS.URL_ENCODED_LIMIT }));

// Input sanitization to prevent XSS (Issue 5)
app.use(sanitizeInput);

// Request timeout configuration (Issue 11)
app.use((req, res, next) => {
  req.setTimeout(TIMEOUTS.REQUEST_TIMEOUT_MS);
  res.setTimeout(TIMEOUTS.REQUEST_TIMEOUT_MS);
  next();
});

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Dependency injection setup
const quizRepository = new InMemoryQuizRepository();
const responseRepository = new InMemoryQuizResponseRepository();
const quizService = new QuizService(quizRepository, responseRepository);

// Initialize sample data
initializeSampleData(quizRepository);

// Routes
const router = createRouter(quizService);
app.use('/api', router);

// Health check (with rate limiting)
app.get('/health', healthLimiter, (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
  logger.info(`Environment: ${NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

export { app, quizRepository, responseRepository, quizService };
