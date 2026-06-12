export type Stage =
  | 'group'
  | 'round-of-32'
  | 'round-of-16'
  | 'quarter-final'
  | 'semi-final'
  | 'third-place'
  | 'final';

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export type TeamRef = {
  id: string;
  name: string;
  abbreviation?: string;
  logo?: string;
  owner?: string;
  placeholder: boolean;
};

export type Match = {
  id: string;
  stage: Stage;
  group?: string;
  kickoff: string;
  status: MatchStatus;
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  homeScore?: number;
  awayScore?: number;
  venue?: string;
};

export type TableRow = {
  team: TeamRef;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export type DataSourceState = {
  source: 'fallback' | 'espn';
  loading: boolean;
  error?: string;
  lastUpdated?: string;
  unmatchedAssignments: string[];
};
