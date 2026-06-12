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

export function calculateGroupTables(
  matches: readonly Match[],
): Record<string, TableRow[]> {
  const groups = new Map<string, Map<string, TableRow>>();

  for (const match of matches) {
    if (
      match.stage !== 'group' ||
      match.status !== 'finished' ||
      !match.group ||
      !isValidScore(match.homeScore) ||
      !isValidScore(match.awayScore)
    ) {
      continue;
    }

    if (!groups.has(match.group)) {
      groups.set(match.group, new Map());
    }

    const group = groups.get(match.group)!;

    if (!group.has(match.homeTeam.id)) {
      group.set(match.homeTeam.id, createRow(match.homeTeam));
    }

    if (!group.has(match.awayTeam.id)) {
      group.set(match.awayTeam.id, createRow(match.awayTeam));
    }

    applyResult(group.get(match.homeTeam.id)!, match.homeScore, match.awayScore);
    applyResult(group.get(match.awayTeam.id)!, match.awayScore, match.homeScore);
  }

  return Object.fromEntries(
    [...groups.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([group, rows]) => [group, sortRows([...rows.values()])]),
  );
}
