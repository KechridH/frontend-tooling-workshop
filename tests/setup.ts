import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vite-plus/test';
import { resetBank } from '../src/mocks/handlers';
import { server } from '../src/mocks/server';

Object.defineProperty(window, 'scrollTo', {
  value: () => undefined,
  writable: true,
});

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
  resetBank();
});
afterAll(() => server.close());
