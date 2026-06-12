import { describe, expect, it } from 'vitest';
import type { Match, TeamRef } from './types';
import {
  getLoadedTeamNames,
  getNextFeaturedMatch,
  groupMatchesByDate,
  partitionMatches,
} from './tournament';

const team = (name: string): TeamRef => ({ id: name, name, placeholder: false });

const match = (id: string, kickoff: string, status: Match['status']): Match => ({
  id,
  kickoff,
  status,
  stage: 'group',
  group: 'A',
  homeTeam: team(`${id} home`),
  awayTeam: team(`${id} away`),
});

describe('tournament helpers', () => {
  it('selects a live match before the next scheduled match', () => {
    const live = match('live', '2026-06-12T19:00:00Z', 'live');
    const scheduled = match('next', '2026-06-12T21:00:00Z', 'scheduled');

    expect(getNextFeaturedMatch([scheduled, live], '2026-06-12T18:00:00Z')).toBe(live);
  });

  it('falls back to the latest finished match when no future match exists', () => {
    const old = match('old', '2026-06-11T19:00:00Z', 'finished');
    const latest = match('latest', '2026-06-12T19:00:00Z', 'finished');

    expect(getNextFeaturedMatch([old, latest], '2026-07-20T12:00:00Z')).toBe(latest);
  });

  it('partitions matches for upcoming, results, and knockout sections', () => {
    const scheduled = match('scheduled', '2026-06-12T21:00:00Z', 'scheduled');
    const finished = match('finished', '2026-06-11T19:00:00Z', 'finished');
    const final: Match = { ...scheduled, id: 'final', stage: 'final' };

    const partitions = partitionMatches([finished, scheduled, final]);

    expect(partitions.upcoming.map((item) => item.id)).toEqual(['scheduled', 'final']);
    expect(partitions.results.map((item) => item.id)).toEqual(['finished']);
    expect(partitions.knockout.map((item) => item.id)).toEqual(['final']);
  });

  it('groups matches by UK-local date label', () => {
    const grouped = groupMatchesByDate([
      match('one', '2026-06-12T19:00:00Z', 'scheduled'),
      match('two', '2026-06-12T21:00:00Z', 'scheduled'),
    ]);

    expect(grouped[0].matches).toHaveLength(2);
    expect(grouped[0].label).toContain('Friday');
  });

  it('returns active loaded team names only', () => {
    const names = getLoadedTeamNames([
      {
        ...match('one', '2026-06-12T19:00:00Z', 'scheduled'),
        homeTeam: team('Mexico'),
        awayTeam: { id: 'placeholder', name: 'Group A Winner', placeholder: true },
      },
    ]);

    expect(names).toEqual(['Mexico']);
  });
});
