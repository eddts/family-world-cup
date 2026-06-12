import { useCallback, useEffect, useMemo, useState } from 'react';
import fallbackEspnScoreboard from '../data/fallbackEspnScoreboard.json';
import { getUnmatchedAssignments } from '../domain/owners';
import { calculateGroupTables } from '../domain/tables';
import type { DataSourceState, Match } from '../domain/types';
import { getLoadedTeamNames } from '../domain/tournament';
import { fetchEspnMatches, normalizeEspnScoreboard } from '../services/espn';

const fallbackMatches = normalizeEspnScoreboard(fallbackEspnScoreboard);

function buildState(matches: readonly Match[], overrides: Partial<DataSourceState>): DataSourceState {
  return {
    source: 'fallback',
    loading: false,
    unmatchedAssignments: getUnmatchedAssignments(getLoadedTeamNames(matches)),
    ...overrides,
  };
}

export function useTournamentData() {
  const [matches, setMatches] = useState<Match[]>(fallbackMatches);
  const [state, setState] = useState<DataSourceState>(() =>
    buildState(fallbackMatches, { source: 'fallback' }),
  );

  const load = useCallback(async (signal?: AbortSignal) => {
    setState((current) => ({ ...current, loading: true, error: undefined }));

    try {
      const espnMatches = await fetchEspnMatches(fetch, signal ? { signal } : undefined);
      if (signal?.aborted) return;

      setMatches(espnMatches);
      setState(
        buildState(espnMatches, {
          source: 'espn',
          loading: false,
          lastUpdated: new Date().toISOString(),
        }),
      );
    } catch (error) {
      if (signal?.aborted) return;

      setMatches(fallbackMatches);
      setState(
        buildState(fallbackMatches, {
          source: 'fallback',
          loading: false,
          error: error instanceof Error ? error.message : 'ESPN request failed',
        }),
      );
    }
  }, []);

  const refresh = useCallback(() => load(), [load]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);

    return () => {
      controller.abort();
    };
  }, [load]);

  const tables = useMemo(() => calculateGroupTables(matches), [matches]);

  return {
    matches,
    tables,
    state,
    refresh,
  };
}
