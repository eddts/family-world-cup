import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useTournamentData } from './useTournamentData';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

function makeResponse(payload: unknown) {
  return {
    ok: true,
    json: async () => payload,
  } as Response;
}

function makePayload(id: string, homeName = 'Mexico', awayName = 'Canada') {
  return {
    events: [
      {
        id,
        date: '2026-06-12T20:00Z',
        season: { slug: 'group-stage' },
        competitions: [
          {
            altGameNote: 'Group A',
            status: { type: { state: 'pre', completed: false } },
            competitors: [
              {
                homeAway: 'home',
                score: '0',
                team: {
                  id: `${id}:home`,
                  displayName: homeName,
                  abbreviation: homeName.slice(0, 3).toUpperCase(),
                  isActive: true,
                },
              },
              {
                homeAway: 'away',
                score: '0',
                team: {
                  id: `${id}:away`,
                  displayName: awayName,
                  abbreviation: awayName.slice(0, 3).toUpperCase(),
                  isActive: true,
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useTournamentData', () => {
  it('starts with fallback data before the ESPN refresh resolves', () => {
    const pending = deferred<Response>();
    const fetchMock = vi.fn((_: RequestInfo | URL, __?: RequestInit) => pending.promise);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTournamentData());

    expect(result.current.matches.length).toBeGreaterThan(0);
    expect(result.current.state.source).toBe('fallback');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('loads ESPN matches and records the last update time', async () => {
    const response = deferred<Response>();
    const fetchMock = vi.fn((_: RequestInfo | URL, __?: RequestInit) => response.promise);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTournamentData());

    await act(async () => {
      response.resolve(makeResponse(makePayload('espn-success')));
    });

    await waitFor(() => expect(result.current.state.source).toBe('espn'));
    expect(result.current.matches.map((match) => match.id)).toEqual(['espn-success']);
    expect(result.current.state.loading).toBe(false);
    expect(Date.parse(result.current.state.lastUpdated ?? '')).not.toBeNaN();
  });

  it('falls back with an error when the current ESPN refresh fails', async () => {
    const response = deferred<Response>();
    const fetchMock = vi.fn((_: RequestInfo | URL, __?: RequestInit) => response.promise);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTournamentData());
    const fallbackCount = result.current.matches.length;

    await act(async () => {
      response.reject(new Error('network down'));
    });

    await waitFor(() => expect(result.current.state.loading).toBe(false));
    expect(result.current.state.source).toBe('fallback');
    expect(result.current.state.error).toBe('network down');
    expect(result.current.matches).toHaveLength(fallbackCount);
  });

  it('ignores stale refreshes that resolve after a newer refresh', async () => {
    const first = deferred<Response>();
    const second = deferred<Response>();
    const fetchMock = vi
      .fn((_: RequestInfo | URL, __?: RequestInit) => first.promise)
      .mockImplementationOnce((_: RequestInfo | URL, __?: RequestInit) => first.promise)
      .mockImplementationOnce((_: RequestInfo | URL, __?: RequestInit) => second.promise);
    vi.stubGlobal('fetch', fetchMock);

    const { result } = renderHook(() => useTournamentData());

    act(() => {
      void result.current.refresh();
    });

    await act(async () => {
      second.resolve(makeResponse(makePayload('newer-refresh')));
    });
    await waitFor(() => expect(result.current.matches.map((match) => match.id)).toEqual(['newer-refresh']));

    await act(async () => {
      first.resolve(makeResponse(makePayload('stale-refresh')));
    });

    expect(result.current.matches.map((match) => match.id)).toEqual(['newer-refresh']);
    expect(result.current.state.source).toBe('espn');
  });

  it('aborts a manual refresh on unmount', async () => {
    const first = deferred<Response>();
    const second = deferred<Response>();
    const signals: AbortSignal[] = [];
    const fetchMock = vi.fn((_: RequestInfo | URL, init?: RequestInit) => {
      if (init?.signal) signals.push(init.signal);
      return signals.length === 1 ? first.promise : second.promise;
    });
    vi.stubGlobal('fetch', fetchMock);

    const { result, unmount } = renderHook(() => useTournamentData());

    await act(async () => {
      first.resolve(makeResponse(makePayload('initial-refresh')));
    });
    await waitFor(() => expect(result.current.state.source).toBe('espn'));

    act(() => {
      void result.current.refresh();
    });

    unmount();

    expect(signals).toHaveLength(2);
    expect(signals[1].aborted).toBe(true);
  });
});
