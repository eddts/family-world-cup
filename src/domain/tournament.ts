import type { Match } from './types';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Europe/London',
});

function byKickoff(left: Match, right: Match) {
  return left.kickoff.localeCompare(right.kickoff);
}

function byKickoffDesc(left: Match, right: Match) {
  return right.kickoff.localeCompare(left.kickoff);
}

export function getNextFeaturedMatch(matches: readonly Match[], nowIso = new Date().toISOString()) {
  const live = matches.filter((match) => match.status === 'live').sort(byKickoff)[0];
  if (live) return live;

  const upcoming = matches
    .filter((match) => match.status === 'scheduled' && match.kickoff >= nowIso)
    .sort(byKickoff)[0];
  if (upcoming) return upcoming;

  return matches.filter((match) => match.status === 'finished').sort(byKickoffDesc)[0];
}

export function partitionMatches(matches: readonly Match[]) {
  const sorted = [...matches].sort(byKickoff);

  return {
    upcoming: sorted.filter((match) => match.status !== 'finished'),
    results: sorted.filter((match) => match.status === 'finished').sort(byKickoffDesc),
    knockout: sorted.filter((match) => match.stage !== 'group'),
  };
}

export function groupMatchesByDate(matches: readonly Match[]) {
  const groups = new Map<string, Match[]>();

  for (const match of matches) {
    const label = dateFormatter.format(new Date(match.kickoff));
    groups.set(label, [...(groups.get(label) ?? []), match]);
  }

  return [...groups.entries()].map(([label, groupedMatches]) => ({
    label,
    matches: groupedMatches.sort(byKickoff),
  }));
}

export function getLoadedTeamNames(matches: readonly Match[]) {
  return [
    ...new Set(
      matches
        .flatMap((match) => [match.homeTeam, match.awayTeam])
        .filter((team) => !team.placeholder)
        .map((team) => team.name),
    ),
  ].sort((left, right) => left.localeCompare(right));
}
