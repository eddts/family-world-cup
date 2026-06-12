import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Match, Stage, TeamRef } from '../domain/types';
import { KnockoutStage } from './KnockoutStage';

const team = (name: string): TeamRef => ({ id: name, name, placeholder: true });

function match(id: string, stage: Stage): Match {
  return {
    id,
    stage,
    kickoff: '2026-07-01T20:00:00Z',
    status: 'scheduled',
    homeTeam: team(`${id} home`),
    awayTeam: team(`${id} away`),
  };
}

describe('KnockoutStage', () => {
  it('renders knockout rounds as vertical round bands with final weekend grouped last', () => {
    const { container } = render(
      <KnockoutStage
        matches={[
          match('r32', 'round-of-32'),
          match('r16', 'round-of-16'),
          match('qf', 'quarter-final'),
          match('sf', 'semi-final'),
          match('third', 'third-place'),
          match('final', 'final'),
        ]}
      />,
    );

    expect(screen.getByTestId('knockout-round-list')).toHaveClass('space-y-8');
    expect(screen.getByTestId('knockout-round-list')).not.toHaveClass('grid');
    expect(screen.getByTestId('final-weekend')).toBeInTheDocument();
    expect(container.querySelector('.xl\\:grid-cols-4')).not.toBeInTheDocument();
    expect(
      screen
        .getByTestId('final-weekend')
        .querySelector('[class*="xl:grid-cols"]'),
    ).not.toBeInTheDocument();

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Round of 32',
      'Round of 16',
      'Quarter-final',
      'Semi-final',
      'Third place / Final',
      'Third place',
      'Final',
    ]);
  });
});
