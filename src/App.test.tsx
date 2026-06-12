import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./hooks/useTournamentData', () => ({
  useTournamentData: () => ({
    matches: [],
    tables: {},
    refresh: vi.fn(),
    state: {
      loading: false,
      source: 'fallback',
      unmatchedAssignments: [],
    },
  }),
}));

describe('App', () => {
  it('does not render the removed public sweepstake badge', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Family World Cup 2026' })).toBeInTheDocument();
    expect(screen.queryByText('Public family sweepstake')).not.toBeInTheDocument();
  });
});
