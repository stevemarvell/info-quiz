/**
 * Application Constants
 * Centralized location for all magic numbers and configuration values
 */

// Scoring Constants
export const SCORING = {
  MAX_SCORE_PER_QUESTION: 5,
  MIN_SCORE_PER_QUESTION: 0,
  PERCENTAGE_DECIMAL_PLACES: 1, // Round percentages to 1 decimal place
} as const;

// Rate Limiting Constants
export const RATE_LIMITS = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS_GENERAL: 100,
  MAX_REQUESTS_WRITE: 30,
} as const;

// Timeout Constants
export const TIMEOUTS = {
  REQUEST_TIMEOUT_MS: 30000, // 30 seconds
} as const;

// Request Size Limits
export const REQUEST_LIMITS = {
  JSON_LIMIT: '1mb',
  URL_ENCODED_LIMIT: '1mb',
} as const;
