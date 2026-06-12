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
  group = 'A',
): Match => ({
  id,
  stage: 'group',
  group,
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
        won: 0,
        drawn: 1,
        lost: 0,
        goalsFor: 1,
        goalsAgainst: 1,
        goalDifference: 0,
        points: 1,
      }),
      expect.objectContaining({
        team: southAfrica,
        played: 1,
        won: 0,
        drawn: 0,
        lost: 1,
        goalsFor: 0,
        goalsAgainst: 2,
        goalDifference: -2,
        points: 0,
      }),
    ]);
  });

  it('includes scheduled group teams with zero stats and ignores knockout matches', () => {
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

    expect(tables).toEqual({
      A: [
        expect.objectContaining({
          team: canada,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        }),
        expect.objectContaining({
          team: mexico,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        }),
      ],
    });
  });

  it('ignores finished group matches with invalid score values', () => {
    const mexico = team('Mexico', 'Nicky');
    const canada = team('Canada', 'Granny');

    const tables = calculateGroupTables([
      groupMatch('nan', mexico, canada, Number.NaN, 0),
      groupMatch('infinity', mexico, canada, 0, Number.POSITIVE_INFINITY),
      groupMatch('negative', mexico, canada, -1, 0),
      groupMatch('decimal', mexico, canada, 1, 1.5),
    ]);

    expect(tables.A.map((row) => row.team.name)).toEqual(['Canada', 'Mexico']);
    expect(tables.A.every((row) => row.played === 0 && row.points === 0)).toBe(true);
  });

  it('orders tied teams by goal difference', () => {
    const alpha = team('Alpha', 'Nicky');
    const bravo = team('Bravo', 'Charlie');
    const charlie = team('Charlie', 'Granny');
    const delta = team('Delta', 'Dan');

    const tables = calculateGroupTables([
      groupMatch('1', alpha, bravo, 2, 0),
      groupMatch('2', charlie, delta, 1, 0),
    ]);

    expect(tables.A.map((row) => row.team.name)).toEqual([
      'Alpha',
      'Charlie',
      'Delta',
      'Bravo',
    ]);
  });

  it('orders tied teams by goals for', () => {
    const alpha = team('Alpha', 'Nicky');
    const bravo = team('Bravo', 'Charlie');
    const charlie = team('Charlie', 'Granny');
    const delta = team('Delta', 'Dan');

    const tables = calculateGroupTables([
      groupMatch('1', alpha, bravo, 3, 2),
      groupMatch('2', charlie, delta, 2, 1),
    ]);

    expect(tables.A.map((row) => row.team.name)).toEqual([
      'Alpha',
      'Charlie',
      'Bravo',
      'Delta',
    ]);
  });

  it('orders fully tied teams by team name', () => {
    const bravo = team('Bravo', 'Charlie');
    const delta = team('Delta', 'Dan');
    const alpha = team('Alpha', 'Nicky');
    const charlie = team('Charlie', 'Granny');

    const tables = calculateGroupTables([
      groupMatch('1', bravo, delta, 1, 0),
      groupMatch('2', alpha, charlie, 1, 0),
    ]);

    expect(tables.A.map((row) => row.team.name)).toEqual([
      'Alpha',
      'Bravo',
      'Charlie',
      'Delta',
    ]);
  });

  it('returns multiple groups in sorted group-label order', () => {
    const mexico = team('Mexico', 'Nicky');
    const canada = team('Canada', 'Granny');
    const brazil = team('Brazil', 'Charlie');
    const france = team('France', 'Dan');

    const tables = calculateGroupTables([
      groupMatch('1', brazil, france, 1, 0, 'B'),
      groupMatch('2', mexico, canada, 2, 0, 'A'),
    ]);

    expect(Object.keys(tables)).toEqual(['A', 'B']);
    expect(tables.A.map((row) => row.team.name)).toEqual(['Mexico', 'Canada']);
    expect(tables.B.map((row) => row.team.name)).toEqual(['Brazil', 'France']);
  });
});
