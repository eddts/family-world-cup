import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Match, TableRow, TeamRef } from '../domain/types';
import { GroupTable } from './GroupTable';
import { MatchCard } from './MatchCard';
import { NextMatchHero } from './NextMatchHero';

const team = (name: string, owner = 'Florence'): TeamRef => ({
  id: name,
  name,
  abbreviation: name.slice(0, 3).toUpperCase(),
  owner,
  placeholder: false,
});

const match: Match = {
  id: 'long-labels',
  stage: 'group',
  group: 'A',
  kickoff: '2026-06-12T20:00:00Z',
  status: 'scheduled',
  venue: 'A very long stadium name that needs to wrap cleanly on small screens',
  homeTeam: team('Bosnia and Herzegovina'),
  awayTeam: team('United States of America', 'Charlie'),
};

const tableRow: TableRow = {
  team: team('Bosnia and Herzegovina'),
  played: 3,
  won: 2,
  drawn: 1,
  lost: 0,
  goalsFor: 7,
  goalsAgainst: 3,
  goalDifference: 4,
  points: 7,
};

describe('responsive mobile layout', () => {
  it('stacks match card teams on mobile and wraps team names', () => {
    render(<MatchCard match={match} />);

    expect(screen.getByTestId('match-card-teams')).toHaveClass('grid-cols-1');
    expect(screen.getByTestId('match-card-teams')).toHaveClass(
      'sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]',
    );
    expect(screen.getByTitle('Bosnia and Herzegovina')).toHaveClass('break-words');
    expect(screen.getByTitle('Bosnia and Herzegovina')).not.toHaveClass('truncate');
  });

  it('lets next match metadata wrap instead of truncating on mobile', () => {
    render(<NextMatchHero match={match} />);

    expect(screen.getByText(match.venue as string)).toHaveClass('break-words');
    expect(screen.getByText(match.venue as string)).not.toHaveClass('truncate');
    expect(screen.getByText('Fri 12 Jun, 21:00')).toHaveClass('break-words');
    expect(screen.getByText('Fri 12 Jun, 21:00')).not.toHaveClass('truncate');
  });

  it('renders a stacked mobile group table instead of only a wide scrolling table', () => {
    render(<GroupTable group="A" rows={[tableRow]} />);

    expect(screen.getByTestId('group-table-mobile')).toHaveClass('sm:hidden');
    expect(screen.getByTestId('group-table-desktop')).toHaveClass('hidden');
    expect(screen.getByTestId('group-table-desktop')).toHaveClass('sm:block');
    expect(within(screen.getByTestId('group-table-mobile')).getByText('GF')).toBeInTheDocument();
    expect(within(screen.getByTestId('group-table-mobile')).getByText('+4')).toBeInTheDocument();
  });
});
