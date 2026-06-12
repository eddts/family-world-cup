import { resolveOwner } from '../domain/owners';
import type { Match, MatchStatus, Stage, TeamRef } from '../domain/types';

export const ESPN_SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300';

const GROUP_NOTE_PATTERN = /\bGroup ([A-L])\b/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRecord(record: Record<string, unknown> | undefined, key: string) {
  const value = record?.[key];
  return isRecord(value) ? value : undefined;
}

function getString(record: Record<string, unknown> | undefined, key: string) {
  const value = record?.[key];
  return typeof value === 'string' ? value : undefined;
}

function getNonEmptyString(record: Record<string, unknown> | undefined, key: string) {
  const value = getString(record, key);
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function getBoolean(record: Record<string, unknown> | undefined, key: string) {
  const value = record?.[key];
  return typeof value === 'boolean' ? value : undefined;
}

function normalizeStage(slug?: string, note?: string): Stage | undefined {
  if (note?.match(GROUP_NOTE_PATTERN)) return 'group';

  switch (slug) {
    case 'group-stage':
      return 'group';
    case 'round-of-32':
      return 'round-of-32';
    case 'round-of-16':
    case 'rd-of-16':
      return 'round-of-16';
    case 'quarterfinals':
    case 'quarter-finals':
      return 'quarter-final';
    case 'semifinals':
    case 'semi-finals':
      return 'semi-final';
    case '3rd-place-match':
      return 'third-place';
    case 'final':
      return 'final';
    default:
      return undefined;
  }
}

function normalizeStatus(competition?: Record<string, unknown>): MatchStatus {
  const status = getRecord(competition, 'status');
  const type = getRecord(status, 'type');
  const state = getString(type, 'state');
  const completed = getBoolean(type, 'completed');

  if (completed || state === 'post') return 'finished';
  if (state === 'in') return 'live';
  return 'scheduled';
}

function extractGroup(note?: string) {
  return note?.match(GROUP_NOTE_PATTERN)?.[1];
}

function parseScore(value: unknown, status: MatchStatus) {
  if (status === 'scheduled') return undefined;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return undefined;

  const score = Number.parseInt(value, 10);
  return Number.isNaN(score) ? undefined : score;
}

function unknownTeam(id: string | undefined, fallbackId: string): TeamRef {
  return {
    id: id ?? fallbackId,
    name: 'Unknown Team',
    placeholder: true,
  };
}

function normalizeTeam(
  competitor: Record<string, unknown> | undefined,
  fallbackId: string,
): TeamRef {
  const team = getRecord(competitor, 'team');
  const id = getNonEmptyString(team, 'id');
  const name = getNonEmptyString(team, 'displayName') ?? getNonEmptyString(team, 'shortDisplayName');

  if (!team || !name) {
    return unknownTeam(id, fallbackId);
  }

  const placeholder = getBoolean(team, 'isActive') === false;
  const logo = getNonEmptyString(team, 'logo');

  return {
    id: id ?? name,
    name,
    abbreviation: getString(team, 'abbreviation'),
    logo,
    owner: placeholder ? undefined : resolveOwner(name),
    placeholder,
  };
}

function getHomeAway(competitors: readonly Record<string, unknown>[]) {
  const home =
    competitors.find((competitor) => getString(competitor, 'homeAway') === 'home') ??
    competitors[0];
  const away =
    competitors.find((competitor) => getString(competitor, 'homeAway') === 'away') ??
    competitors[1];
  return { home, away };
}

export function normalizeEspnScoreboard(payload: unknown): Match[] {
  if (!isRecord(payload) || !Array.isArray(payload.events)) {
    return [];
  }

  return payload.events
    .map((event): Match | undefined => {
      if (!isRecord(event)) {
        return undefined;
      }

      const competitions = event.competitions;

      if (!Array.isArray(competitions) || !isRecord(competitions[0])) {
        return undefined;
      }

      const competition = competitions[0];
      const competitorValues = competition.competitors;

      if (!Array.isArray(competitorValues)) {
        return undefined;
      }

      const competitors = competitorValues.filter(isRecord);
      const id = getString(event, 'id');
      const date = getString(event, 'date');

      if (!id || !date || competitors.length < 2) {
        return undefined;
      }

      const season = getRecord(event, 'season');
      const { home, away } = getHomeAway(competitors);
      const note = getString(competition, 'altGameNote');
      const stage = normalizeStage(getString(season, 'slug'), note);

      if (!stage) {
        return undefined;
      }

      const status = normalizeStatus(competition);
      const venue = getRecord(competition, 'venue');

      return {
        id,
        stage,
        group: extractGroup(note),
        kickoff: date,
        status,
        venue: getString(venue, 'fullName') ?? getString(venue, 'displayName'),
        homeScore: parseScore(home.score, status),
        awayScore: parseScore(away.score, status),
        homeTeam: normalizeTeam(home, `${id}:home:placeholder`),
        awayTeam: normalizeTeam(away, `${id}:away:placeholder`),
      };
    })
    .filter((match): match is Match => Boolean(match))
    .sort((left, right) => left.kickoff.localeCompare(right.kickoff));
}

export async function fetchEspnMatches(fetcher: typeof fetch = fetch, init?: RequestInit) {
  const response = await fetcher(ESPN_SCOREBOARD_URL, init);

  if (!response.ok) {
    throw new Error(`ESPN request failed with ${response.status}`);
  }

  return normalizeEspnScoreboard(await response.json());
}
