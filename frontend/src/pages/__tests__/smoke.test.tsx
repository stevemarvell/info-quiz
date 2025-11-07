import { describe, it, expect } from 'vitest';

describe('Smoke Tests', () => {
  it('should pass basic smoke test', () => {
    expect(1 + 1).toBe(2);
  });

  it('can import react', () => {
    const React = require('react');
    expect(React).toBeDefined();
  });

  it('can import testing library', () => {
    const { render } = require('@testing-library/react');
    expect(render).toBeDefined();
  });
});
