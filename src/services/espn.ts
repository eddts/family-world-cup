import { resolveOwner } from '../domain/owners';
import type { Match, MatchStatus, Stage, TeamRef } from '../domain/types';

export const ESPN_SCOREBOARD_URL =
  'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=20260611-20260719&limit=300';

type EspnTeam = {
  id?: string;
  displayName?: string;
  shortDisplayName?: string;
  abbreviation?: string;
  logo?: string;
  isActive?: boolean;
};

type EspnCompetitor = {
  homeAway?: 'home' | 'away';
  score?: string;
  team?: EspnTeam;
};

type EspnCompetition = {
  altGameNote?: string;
  venue?: {
    fullName?: string;
    displayName?: string;
  };
  status?: {
    type?: {
      state?: string;
      completed?: boolean;
    };
  };
  competitors?: EspnCompetitor[];
};

type EspnEvent = {
  id?: string;
  date?: string;
  season?: {
    slug?: string;
  };
  competitions?: EspnCompetition[];
};

type EspnScoreboard = {
  events?: EspnEvent[];
};

function normalizeStage(slug?: string, note?: string): Stage {
  if (note?.match(/Group [A-L]/)) return 'group';

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
      return 'group';
  }
}

function normalizeStatus(competition?: EspnCompetition): MatchStatus {
  const state = competition?.status?.type?.state;
  const completed = competition?.status?.type?.completed;

  if (completed || state === 'post') return 'finished';
  if (state === 'in') return 'live';
  return 'scheduled';
}

function extractGroup(note?: string) {
  return note?.match(/Group ([A-L])/)?.[1];
}

function parseScore(value: string | undefined, status: MatchStatus) {
  if (status === 'scheduled') return undefined;
  if (value === undefined) return undefined;

  const score = Number.parseInt(value, 10);
  return Number.isNaN(score) ? undefined : score;
}

function normalizeTeam(competitor: EspnCompetitor | undefined): TeamRef {
  const team = competitor?.team ?? {};
  const name = team.displayName ?? team.shortDisplayName ?? 'Unknown Team';
  const logo = team.logo || undefined;

  return {
    id: team.id ?? name,
    name,
    abbreviation: team.abbreviation,
    logo,
    owner: team.isActive === false ? undefined : resolveOwner(name),
    placeholder: team.isActive === false,
  };
}

function getHomeAway(competitors: readonly EspnCompetitor[]) {
  const home = competitors.find((competitor) => competitor.homeAway === 'home') ?? competitors[0];
  const away = competitors.find((competitor) => competitor.homeAway === 'away') ?? competitors[1];
  return { home, away };
}

export function normalizeEspnScoreboard(payload: unknown): Match[] {
  const scoreboard = payload as EspnScoreboard;

  return (scoreboard.events ?? [])
    .map((event): Match | undefined => {
      const competition = event.competitions?.[0];
      const competitors = competition?.competitors ?? [];

      if (!event.id || !event.date || competitors.length < 2) {
        return undefined;
      }

      const { home, away } = getHomeAway(competitors);
      const note = competition?.altGameNote;
      const stage = normalizeStage(event.season?.slug, note);
      const status = normalizeStatus(competition);

      return {
        id: event.id,
        stage,
        group: extractGroup(note),
        kickoff: event.date,
        status,
        venue: competition?.venue?.fullName ?? competition?.venue?.displayName,
        homeScore: parseScore(home?.score, status),
        awayScore: parseScore(away?.score, status),
        homeTeam: normalizeTeam(home),
        awayTeam: normalizeTeam(away),
      };
    })
    .filter((match): match is Match => Boolean(match))
    .sort((left, right) => left.kickoff.localeCompare(right.kickoff));
}

export async function fetchEspnMatches(fetcher: typeof fetch = fetch) {
  const response = await fetcher(ESPN_SCOREBOARD_URL);

  if (!response.ok) {
    throw new Error(`ESPN request failed with ${response.status}`);
  }

  return normalizeEspnScoreboard(await response.json());
}
