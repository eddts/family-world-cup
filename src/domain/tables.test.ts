import { describe, expect, it } from 'vitest';
import type { Match, TeamRef } from './types';
import { calculateGroupTables } from './tables';

const team = (name: string, owner: string): TeamRef => ({
  id: name,
  name,
  owner,
  placeholder: false,
});

const groupMatch = (
  id: string,
  homeTeam: TeamRef,
  awayTeam: TeamRef,
  homeScore: number,
  awayScore: number,
): Match => ({
  id,
  stage: 'group',
  group: 'A',
  kickoff: '2026-06-11T19:00:00Z',
  status: 'finished',
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
});

describe('calculateGroupTables', () => {
  it('calculates football table rows from finished group matches', () => {
    const mexico = team('Mexico', 'Nicky');
    const southAfrica = team('South Africa', 'Charlie');
    const canada = team('Canada', 'Granny');

    const tables = calculateGroupTables([
      groupMatch('1', mexico, southAfrica, 2, 0),
      groupMatch('2', canada, mexico, 1, 1),
    ]);

    expect(tables.A).toEqual([
      expect.objectContaining({
        team: mexico,
        played: 2,
        won: 1,
        drawn: 1,
        lost: 0,
        goalsFor: 3,
        goalsAgainst: 1,
        goalDifference: 2,
        points: 4,
      }),
      expect.objectContaining({
        team: canada,
        played: 1,
        points: 1,
      }),
      expect.objectContaining({
        team: southAfrica,
        played: 1,
        points: 0,
      }),
    ]);
  });

  it('ignores scheduled matches and knockout matches', () => {
    const mexico = team('Mexico', 'Nicky');
    const canada = team('Canada', 'Granny');

    const tables = calculateGroupTables([
      {
        id: 'scheduled',
        stage: 'group',
        group: 'A',
        kickoff: '2026-06-12T19:00:00Z',
        status: 'scheduled',
        homeTeam: mexico,
        awayTeam: canada,
      },
      {
        id: 'knockout',
        stage: 'final',
        kickoff: '2026-07-19T19:00:00Z',
        status: 'finished',
        homeTeam: mexico,
        awayTeam: canada,
        homeScore: 1,
        awayScore: 0,
      },
    ]);

    expect(tables).toEqual({});
  });
});
