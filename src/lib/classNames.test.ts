import { describe, expect, it } from 'vitest';
import { cn } from './classNames';

describe('cn', () => {
  it('joins class names while dropping falsy values', () => {
    expect(cn('base', false, undefined, null, '', 'active')).toBe('base active');
  });
});
