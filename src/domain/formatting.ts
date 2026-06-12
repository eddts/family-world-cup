import type { Match, Stage } from './types';

const kickoffFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/London',
});

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Europe/London',
});

const stageLabels: Record<Stage, string> = {
  group: 'Group',
  'round-of-32': 'Round of 32',
  'round-of-16': 'Round of 16',
  'quarter-final': 'Quarter-final',
  'semi-final': 'Semi-final',
  'third-place': 'Third place',
  final: 'Final',
};

export function formatKickoff(value: string) {
  return kickoffFormatter.format(new Date(value));
}

export function formatKickoffTime(value: string) {
  return timeFormatter.format(new Date(value));
}

export function getStageLabel(stage: Stage) {
  return stageLabels[stage];
}

export function getMatchScore(match: Match) {
  if (match.status === 'scheduled') {
    return formatKickoffTime(match.kickoff);
  }

  return `${match.homeScore ?? 0}-${match.awayScore ?? 0}`;
}

export function getStatusLabel(match: Match) {
  if (match.status === 'live') return 'LIVE';
  if (match.status === 'finished') return 'FT';
  return formatKickoffTime(match.kickoff);
}
