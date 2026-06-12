import { describe, expect, it } from 'vitest';
import fallbackEspnScoreboard from '../data/fallbackEspnScoreboard.json';
import { resolveCanonicalTeamName, resolveOwner } from '../domain/owners';
import { espnScoreboardFixture } from '../test/espnScoreboardFixture';
import { ESPN_SCOREBOARD_URL, fetchEspnMatches, normalizeEspnScoreboard } from './espn';

function completedEvent(id: string, homeScore?: string, awayScore?: string) {
  return {
    id,
    date: `2026-06-${id.slice(-2)}T19:00Z`,
    season: { slug: 'group-stage' },
    competitions: [
      {
        altGameNote: 'FIFA World Cup, Group A',
        status: {
          type: {
            state: 'post',
            completed: true,
          },
        },
        competitors: [
          {
            homeAway: 'home',
            ...(homeScore === undefined ? {} : { score: homeScore }),
            team: {
              id: '203',
              displayName: 'Mexico',
              abbreviation: 'MEX',
              isActive: true,
            },
          },
          {
            homeAway: 'away',
            ...(awayScore === undefined ? {} : { score: awayScore }),
            team: {
              id: '467',
              displayName: 'South Africa',
              abbreviation: 'RSA',
              isActive: true,
            },
          },
        ],
      },
    ],
  };
}

describe('normalizeEspnScoreboard', () => {
  it('maps completed group matches with owners and group letters', () => {
    const matches = normalizeEspnScoreboard(espnScoreboardFixture);

    expect(matches[0]).toEqual({
      id: '760415',
      stage: 'group',
      group: 'A',
      kickoff: '2026-06-11T19:00Z',
      status: 'finished',
      venue: 'Estadio Banorte',
      homeScore: 2,
      awayScore: 0,
      homeTeam: {
        id: '203',
        name: 'Mexico',
        abbreviation: 'MEX',
        logo: 'https://a.espncdn.com/i/teamlogos/countries/500/mex.png',
        owner: 'Nicky',
        placeholder: false,
      },
      awayTeam: {
        id: '467',
        name: 'South Africa',
        abbreviation: 'RSA',
        logo: 'https://a.espncdn.com/i/teamlogos/countries/500/rsa.png',
        owner: 'Charlie',
        placeholder: false,
      },
    });
  });

  it('maps knockout placeholders without fake scores', () => {
    const matches = normalizeEspnScoreboard(espnScoreboardFixture);
    const final = matches[1];

    expect(final.stage).toBe('final');
    expect(final.status).toBe('scheduled');
    expect(final.homeScore).toBeUndefined();
    expect(final.awayScore).toBeUndefined();
    expect(final.homeTeam.placeholder).toBe(true);
    expect(final.homeTeam.owner).toBeUndefined();
    expect(final.awayTeam.placeholder).toBe(true);
    expect(final.awayTeam.owner).toBeUndefined();
  });

  it('uses the full tournament date range endpoint', () => {
    expect(ESPN_SCOREBOARD_URL).toBe(
      'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300',
    );
  });

  it('returns no matches for malformed scoreboard roots', () => {
    expect(normalizeEspnScoreboard(null)).toEqual([]);
    expect(normalizeEspnScoreboard('not a scoreboard')).toEqual([]);
    expect(normalizeEspnScoreboard({ events: {} })).toEqual([]);
    expect(normalizeEspnScoreboard({ events: [null] })).toEqual([]);
  });

  it('skips events with invalid competitor shapes', () => {
    const matches = normalizeEspnScoreboard({
      events: [
        {
          id: 'bad-competitors',
          date: '2026-06-11T19:00Z',
          season: { slug: 'group-stage' },
          competitions: [
            {
              altGameNote: 'FIFA World Cup, Group A',
              competitors: {},
            },
          ],
        },
        {
          id: 'bad-competitor-entry',
          date: '2026-06-12T19:00Z',
          season: { slug: 'group-stage' },
          competitions: [
            {
              altGameNote: 'FIFA World Cup, Group A',
              competitors: [
                null,
                {
                  homeAway: 'away',
                  team: {
                    displayName: 'Mexico',
                    isActive: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(matches).toEqual([]);
  });

  it('treats competitors without team names as placeholders', () => {
    const matches = normalizeEspnScoreboard({
      events: [
        {
          id: 'missing-team-data',
          date: '2026-06-11T19:00Z',
          season: { slug: 'group-stage' },
          competitions: [
            {
              altGameNote: 'FIFA World Cup, Group A',
              competitors: [
                {
                  homeAway: 'home',
                },
                {
                  homeAway: 'away',
                  team: {
                    id: '203',
                    abbreviation: 'MEX',
                    isActive: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    });

    expect(matches[0].homeTeam.name).toBe('Unknown Team');
    expect(matches[0].homeTeam.placeholder).toBe(true);
    expect(matches[0].homeTeam.owner).toBeUndefined();
    expect(matches[0].awayTeam.name).toBe('Unknown Team');
    expect(matches[0].awayTeam.placeholder).toBe(true);
    expect(matches[0].awayTeam.owner).toBeUndefined();
  });

  it('skips events with unknown stages', () => {
    const matches = normalizeEspnScoreboard({
      events: [
        {
          ...completedEvent('unknown-stage-11', '1', '0'),
          season: { slug: 'friendly' },
          competitions: [
            {
              ...completedEvent('unknown-stage-11', '1', '0').competitions[0],
              altGameNote: 'FIFA World Cup',
            },
          ],
        },
      ],
    });

    expect(matches).toEqual([]);
  });

  it('only parses non-negative integer score strings', () => {
    const matches = normalizeEspnScoreboard({
      events: [
        completedEvent('score-11', '2abc', '1.5'),
        completedEvent('score-12', '-1', ''),
        completedEvent('score-13', undefined, '0'),
      ],
    });

    expect(matches.find((match) => match.id === 'score-11')?.homeScore).toBeUndefined();
    expect(matches.find((match) => match.id === 'score-11')?.awayScore).toBeUndefined();
    expect(matches.find((match) => match.id === 'score-12')?.homeScore).toBeUndefined();
    expect(matches.find((match) => match.id === 'score-12')?.awayScore).toBeUndefined();
    expect(matches.find((match) => match.id === 'score-13')?.homeScore).toBeUndefined();
    expect(matches.find((match) => match.id === 'score-13')?.awayScore).toBe(0);
  });

  it('normalizes the fallback ESPN snapshot safely', () => {
    const matches = normalizeEspnScoreboard(fallbackEspnScoreboard);

    expect(matches).toHaveLength(104);

    for (const match of matches.filter((match) => match.status === 'scheduled')) {
      expect(match.homeScore).toBeUndefined();
      expect(match.awayScore).toBeUndefined();
    }

    const teams = matches.flatMap((match) => [match.homeTeam, match.awayTeam]);

    for (const team of teams.filter((team) => team.placeholder)) {
      expect(team.owner).toBeUndefined();
    }

    const assignedTeams = teams.filter(
      (team) => !team.placeholder && resolveCanonicalTeamName(team.name),
    );

    expect(assignedTeams.length).toBeGreaterThan(0);

    for (const team of assignedTeams) {
      expect(team.owner).toBe(resolveOwner(team.name));
    }

    expect(assignedTeams).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Mexico', owner: 'Nicky' }),
        expect.objectContaining({ name: 'South Africa', owner: 'Charlie' }),
      ]),
    );
  });
});

describe('fetchEspnMatches', () => {
  it('passes fetch init options through to the fetcher', async () => {
    const controller = new AbortController();
    const calls: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    const fetcher: typeof fetch = async (input, init) => {
      calls.push([input, init]);
      return new Response(JSON.stringify({ events: [] }), { status: 200 });
    };

    await fetchEspnMatches(fetcher, { signal: controller.signal });

    expect(calls).toEqual([[ESPN_SCOREBOARD_URL, { signal: controller.signal }]]);
  });
});
