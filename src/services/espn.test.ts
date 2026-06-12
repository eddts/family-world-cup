import { describe, expect, it } from 'vitest';
import { espnScoreboardFixture } from '../test/espnScoreboardFixture';
import { ESPN_SCOREBOARD_URL, normalizeEspnScoreboard } from './espn';

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
    expect(final.homeTeam.placeholder).toBe(true);
    expect(final.homeTeam.owner).toBeUndefined();
  });

  it('uses the full tournament date range endpoint', () => {
    expect(ESPN_SCOREBOARD_URL).toBe(
      'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300',
    );
  });
});
