import { describe, expect, it } from 'vitest';
import { getUnmatchedAssignments, resolveOwner } from './owners';

describe('resolveOwner', () => {
  it('returns owners for exact ESPN team labels', () => {
    expect(resolveOwner('Mexico')).toBe('Nicky');
    expect(resolveOwner('Bosnia-Herzegovina')).toBe('Edd');
    expect(resolveOwner('Canada')).toBe('Granny');
  });

  it('returns owners through common ESPN label variants', () => {
    expect(resolveOwner('Korea Republic')).toBe('Ant');
    expect(resolveOwner('Cote d Ivoire')).toBe('William');
    expect(resolveOwner('DR Congo')).toBe('Sarah');
    expect(resolveOwner('Curacao')).toBe('Nanny');
  });

  it('returns undefined for teams outside the sweepstake', () => {
    expect(resolveOwner('Atlantis')).toBeUndefined();
  });

  it('reports source assignments that did not match loaded ESPN names', () => {
    const unmatched = getUnmatchedAssignments(['Mexico', 'Canada', 'England']);
    expect(unmatched).toContain('Bosnia-Herzegovina');
    expect(unmatched).not.toContain('Mexico');
  });
});
