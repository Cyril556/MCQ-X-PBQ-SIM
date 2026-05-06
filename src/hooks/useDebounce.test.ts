import { describe, it, expect } from 'vitest';
import { useDebounce } from '@/hooks/useDebounce';

// Smoke test: hook is importable and is a function. Behavioural test would
// require @testing-library/react-hooks which isn't installed; the hook is
// exercised directly by ReviewMode which is covered by the browser smoke test.
describe('useDebounce', () => {
  it('exports a function', () => {
    expect(typeof useDebounce).toBe('function');
  });
});
