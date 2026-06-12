import { participantAssignments, teamAliases } from '../data/participants';

export function normalizeTeamName(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const canonicalTeamByNormalizedName = new Map<string, string>();

for (const assignment of participantAssignments) {
  for (const team of assignment.teams) {
    canonicalTeamByNormalizedName.set(normalizeTeamName(team), team);
  }
}

for (const [alias, canonical] of Object.entries(teamAliases)) {
  canonicalTeamByNormalizedName.set(normalizeTeamName(alias), canonical);
}

const ownerByCanonicalTeam = new Map<string, string>();

for (const assignment of participantAssignments) {
  for (const team of assignment.teams) {
    ownerByCanonicalTeam.set(team, assignment.person);
  }
}

export function resolveCanonicalTeamName(teamName: string) {
  return canonicalTeamByNormalizedName.get(normalizeTeamName(teamName));
}

export function resolveOwner(teamName: string) {
  const canonicalTeamName = resolveCanonicalTeamName(teamName);
  return canonicalTeamName ? ownerByCanonicalTeam.get(canonicalTeamName) : undefined;
}

export function getUnmatchedAssignments(loadedTeamNames: readonly string[]) {
  const loadedCanonicalNames = new Set(
    loadedTeamNames
      .map(resolveCanonicalTeamName)
      .filter((teamName): teamName is string => Boolean(teamName)),
  );

  return participantAssignments
    .flatMap((assignment) => [...assignment.teams])
    .filter((teamName) => !loadedCanonicalNames.has(teamName));
}
