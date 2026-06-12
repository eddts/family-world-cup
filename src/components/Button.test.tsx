import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('uses a visually distinct action style with keyboard and disabled states', () => {
    render(<Button disabled>Refresh</Button>);

    const button = screen.getByRole('button', { name: 'Refresh' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('bg-ink');
    expect(button).toHaveClass('focus-visible:outline');
    expect(button).toHaveClass('active:translate-x-1');
    expect(button).toHaveClass('disabled:cursor-not-allowed');
  });
});
