import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Match, TeamRef } from '../domain/types';
import { MatchSections } from './MatchSections';

const team = (name: string): TeamRef => ({ id: name, name, placeholder: false });

function match(id: string, kickoff: string): Match {
  return {
    id,
    kickoff,
    status: 'finished',
    stage: 'group',
    group: 'A',
    homeTeam: team(`${id} home`),
    awayTeam: team(`${id} away`),
    homeScore: 1,
    awayScore: 0,
  };
}

describe('MatchSections', () => {
  it('keeps historic score groups newest first when requested', () => {
    render(
      <MatchSections
        title="Historic Scores"
        matches={[
          match('older', '2026-06-12T19:00:00Z'),
          match('newer', '2026-06-13T19:00:00Z'),
        ]}
        sortDirection="desc"
      />,
    );

    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Saturday 13 June',
      'Friday 12 June',
    ]);
  });
});
