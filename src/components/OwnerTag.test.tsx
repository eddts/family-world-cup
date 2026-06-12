import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { OwnerTag } from './OwnerTag';

describe('OwnerTag', () => {
  it('uses a readable owner badge treatment instead of display type', () => {
    render(<OwnerTag owner="Charlie" size="hero" />);

    const tag = screen.getByTitle('Charlie');
    expect(tag).toHaveClass('font-body');
    expect(tag).toHaveClass('font-semibold');
    expect(tag).toHaveClass('text-lg');
    expect(tag).not.toHaveClass('font-display');
  });
});
