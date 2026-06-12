import type { Match, TableRow, TeamRef } from './types';

function createRow(team: TeamRef): TableRow {
  return {
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function isValidScore(score: unknown): score is number {
  return typeof score === 'number' && Number.isInteger(score) && score >= 0;
}

function applyResult(row: TableRow, goalsFor: number, goalsAgainst: number) {
  row.played += 1;
  row.goalsFor += goalsFor;
  row.goalsAgainst += goalsAgainst;
  row.goalDifference = row.goalsFor - row.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    row.won += 1;
    row.points += 3;
  } else if (goalsFor === goalsAgainst) {
    row.drawn += 1;
    row.points += 1;
  } else {
    row.lost += 1;
  }
}

function sortRows(rows: TableRow[]) {
  return rows.sort((left, right) => {
    if (right.points !== left.points) return right.points - left.points;
    if (right.goalDifference !== left.goalDifference) {
      return right.goalDifference - left.goalDifference;
    }
    if (right.goalsFor !== left.goalsFor) return right.goalsFor - left.goalsFor;
    return left.team.name.localeCompare(right.team.name);
  });
}

function ensureGroup(groups: Map<string, Map<string, TableRow>>, groupName: string) {
  if (!groups.has(groupName)) {
    groups.set(groupName, new Map());
  }

  return groups.get(groupName)!;
}

function ensureRow(group: Map<string, TableRow>, team: TeamRef) {
  if (team.placeholder) return undefined;

  if (!group.has(team.id)) {
    group.set(team.id, createRow(team));
  }

  return group.get(team.id)!;
}

export function calculateGroupTables(
  matches: readonly Match[],
): Record<string, TableRow[]> {
  const groups = new Map<string, Map<string, TableRow>>();

  for (const match of matches) {
    if (match.stage !== 'group' || !match.group) {
      continue;
    }

    const group = ensureGroup(groups, match.group);
    const homeRow = ensureRow(group, match.homeTeam);
    const awayRow = ensureRow(group, match.awayTeam);

    if (
      homeRow &&
      awayRow &&
      match.status === 'finished' &&
      isValidScore(match.homeScore) &&
      isValidScore(match.awayScore)
    ) {
      applyResult(homeRow, match.homeScore, match.awayScore);
      applyResult(awayRow, match.awayScore, match.homeScore);
    }
  }

  return Object.fromEntries(
    [...groups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([group, rows]) => [group, sortRows([...rows.values()])]),
  );
}
