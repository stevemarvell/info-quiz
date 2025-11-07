import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from '../mocks/server';

// Start MSW server before all tests (Chicago/classicist approach)
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset handlers after each test to ensure test isolation
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Clean up MSW server after all tests
afterAll(() => {
  server.close();
});
