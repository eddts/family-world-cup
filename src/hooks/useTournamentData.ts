import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const activeControllerRef = useRef<AbortController | undefined>(undefined);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    activeControllerRef.current?.abort();
    const controller = new AbortController();
    activeControllerRef.current = controller;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setState((current) => ({ ...current, loading: true, error: undefined }));

    try {
      const espnMatches = await fetchEspnMatches(fetch, { signal: controller.signal });
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;

      setMatches(espnMatches);
      setState(
        buildState(espnMatches, {
          source: 'espn',
          loading: false,
          lastUpdated: new Date().toISOString(),
        }),
      );
    } catch (error) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return;

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

  useEffect(() => {
    void refresh();

    return () => {
      requestIdRef.current += 1;
      activeControllerRef.current?.abort();
    };
  }, [refresh]);

  const tables = useMemo(() => calculateGroupTables(matches), [matches]);

  return {
    matches,
    tables,
    state,
    refresh,
  };
}
