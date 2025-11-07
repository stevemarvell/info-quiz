import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server for Node environment (Vitest)
// This intercepts network requests at the network level
// Chicago/classicist testing approach: mock external boundaries, not modules
export const server = setupServer(...handlers);
