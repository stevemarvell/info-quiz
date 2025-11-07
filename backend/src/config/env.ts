import { z } from 'zod';
import { logger } from '../utils/logger';

// Define environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('3000'),
  CORS_ORIGIN: z.string().url().default('http://localhost:8100'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 * Throws an error if validation fails
 */
export const validateEnv = (): Env => {
  try {
    const env = envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      LOG_LEVEL: process.env.LOG_LEVEL,
    });

    logger.info('Environment variables validated successfully', {
      NODE_ENV: env.NODE_ENV,
      PORT: env.PORT,
      CORS_ORIGIN: env.CORS_ORIGIN,
    });

    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Environment variable validation failed', {
        errors: error.errors,
      });

      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });

      process.exit(1);
    }
    throw error;
  }
};

// Export validated environment variables
export const env = validateEnv();
