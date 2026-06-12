import { formatKickoff } from '../domain/formatting';
import type { DataSourceState } from '../domain/types';

type DataStatusProps = {
  state: DataSourceState;
  onRefresh: () => void | Promise<void>;
  className?: string;
};

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ');
}

function getSourceLabel(source: DataSourceState['source']) {
  return source === 'espn' ? 'ESPN live data' : 'Fallback snapshot';
}

export function DataStatus({ state, onRefresh, className }: DataStatusProps) {
  return (
    <aside
      className={classNames(
        'border-4 border-ink bg-paper p-4 text-ink shadow-hard',
        className,
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-display text-2xl uppercase leading-none">
            {getSourceLabel(state.source)}
          </p>
          <p className="mt-1 text-sm font-black uppercase text-ink/70">
            {state.lastUpdated
              ? `Updated ${formatKickoff(state.lastUpdated)}`
              : 'Awaiting refresh'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void onRefresh();
          }}
          disabled={state.loading}
          className="inline-flex min-h-[2.75rem] items-center justify-center border-4 border-ink bg-posterGreen px-4 py-2 font-display text-base uppercase leading-none text-white shadow-hardSm transition disabled:cursor-not-allowed disabled:bg-ink/30 disabled:text-ink/60 disabled:shadow-none"
        >
          {state.loading ? 'Loading' : 'Refresh'}
        </button>
      </div>

      {state.error && (
        <p
          role="alert"
          className="mt-4 border-4 border-ink bg-posterRed px-3 py-2 font-black uppercase text-white shadow-hardSm"
        >
          {state.error}
        </p>
      )}

      {state.unmatchedAssignments.length > 0 && (
        <div className="mt-4 border-t-4 border-ink pt-4">
          <p className="font-display text-lg uppercase leading-none">
            Unmatched assignments
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {state.unmatchedAssignments.map((teamName) => (
              <li
                key={teamName}
                className="max-w-full border-2 border-ink bg-white px-2 py-1 text-xs font-black uppercase shadow-hardSm"
              >
                <span className="block truncate">{teamName}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

export default DataStatus;
