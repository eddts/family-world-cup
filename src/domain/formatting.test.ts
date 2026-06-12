import { describe, expect, it } from 'vitest';
import type { Match, TeamRef } from './types';
import {
  formatKickoff,
  formatKickoffTime,
  getMatchScore,
  getStageLabel,
  getStatusLabel,
} from './formatting';

const mexico: TeamRef = {
  id: 'mexico',
  name: 'Mexico',
  abbreviation: 'MEX',
  owner: 'Nicky',
  placeholder: false,
};

const canada: TeamRef = {
  id: 'canada',
  name: 'Canada',
  abbreviation: 'CAN',
  owner: 'Granny',
  placeholder: false,
};

function match(overrides: Partial<Match> = {}): Match {
  return {
    id: 'match-1',
    stage: 'group',
    group: 'A',
    kickoff: '2026-06-12T19:00:00Z',
    status: 'scheduled',
    homeTeam: mexico,
    awayTeam: canada,
    ...overrides,
  };
}

describe('formatKickoff', () => {
  it('formats kickoff in UK-local date and time', () => {
    expect(formatKickoff('2026-06-12T19:00:00Z')).toBe('Fri 12 Jun, 20:00');
  });
});

describe('formatKickoffTime', () => {
  it('formats kickoff time in the Europe/London timezone', () => {
    expect(formatKickoffTime('2026-06-12T19:00:00Z')).toBe('20:00');
  });
});

describe('getStageLabel', () => {
  it('returns display labels for every tournament stage', () => {
    expect(getStageLabel('group')).toBe('Group');
    expect(getStageLabel('round-of-32')).toBe('Round of 32');
    expect(getStageLabel('round-of-16')).toBe('Round of 16');
    expect(getStageLabel('quarter-final')).toBe('Quarter-final');
    expect(getStageLabel('semi-final')).toBe('Semi-final');
    expect(getStageLabel('third-place')).toBe('Third place');
    expect(getStageLabel('final')).toBe('Final');
  });
});

describe('getMatchScore', () => {
  it('returns kickoff time for scheduled matches', () => {
    expect(getMatchScore(match())).toBe('20:00');
  });

  it('returns scoreline for active matches and defaults missing scores to zero', () => {
    expect(getMatchScore(match({ status: 'live', homeScore: 2 }))).toBe('2-0');
  });
});

describe('getStatusLabel', () => {
  it('returns compact status labels for live, finished, and scheduled matches', () => {
    expect(getStatusLabel(match({ status: 'live' }))).toBe('LIVE');
    expect(getStatusLabel(match({ status: 'finished' }))).toBe('FT');
    expect(getStatusLabel(match())).toBe('20:00');
  });
});
