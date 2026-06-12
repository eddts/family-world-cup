import type { TableRow, TeamRef } from '../domain/types';
import { cn } from '../lib/classNames';
import { OwnerTag } from './OwnerTag';

type GroupTableProps = {
  group: string;
  rows: readonly TableRow[];
  className?: string;
};

function getInitials(team: TeamRef) {
  if (team.abbreviation?.trim()) {
    return team.abbreviation.trim().slice(0, 3).toUpperCase();
  }

  return team.name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
}

function formatGoalDifference(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

function getRowStats(row: TableRow) {
  return [
    ['P', row.played],
    ['W', row.won],
    ['D', row.drawn],
    ['L', row.lost],
    ['GF', row.goalsFor],
    ['GA', row.goalsAgainst],
    ['GD', formatGoalDifference(row.goalDifference)],
    ['Pts', row.points],
  ] as const;
}

export function GroupTable({ group, rows, className }: GroupTableProps) {
  return (
    <section
      className={cn(
        'overflow-hidden border-4 border-ink bg-white text-ink shadow-hard',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b-4 border-ink bg-posterGreen px-4 py-3 text-white">
        <h2 className="font-display text-3xl uppercase leading-none">Group {group}</h2>
        <span className="font-display text-lg uppercase leading-none">
          {rows.length} teams
        </span>
      </div>

      <div data-testid="group-table-mobile" className="sm:hidden">
        {rows.map((row) => (
          <article key={row.team.id} className="border-t-4 border-ink p-3">
            <div className="flex flex-col gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border-2 border-ink bg-paper">
                  {row.team.logo ? (
                    <img
                      src={row.team.logo}
                      alt=""
                      className="h-full w-full object-contain p-1"
                      loading="lazy"
                    />
                  ) : (
                    <span className="px-1 text-center font-display text-sm uppercase leading-none">
                      {getInitials(row.team) || '?'}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3
                    className="break-words font-display text-2xl uppercase leading-none [overflow-wrap:anywhere]"
                    title={row.team.name}
                  >
                    {row.team.name}
                  </h3>
                  <OwnerTag owner={row.team.owner} className="mt-2" />
                </div>
              </div>

              <dl className="grid grid-cols-4 gap-2">
                {getRowStats(row).map(([label, value]) => (
                  <div
                    key={label}
                    className="border-2 border-ink bg-paper px-2 py-2 text-center"
                  >
                    <dt className="font-display text-xs uppercase leading-none text-ink/70">
                      {label}
                    </dt>
                    <dd className="mt-1 font-display text-xl uppercase leading-none">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </div>

      <div data-testid="group-table-desktop" className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="bg-ink text-paper">
            <tr>
              <th scope="col" className="px-3 py-3 font-display text-sm uppercase">
                Team
              </th>
              <th scope="col" className="px-3 py-3 font-display text-sm uppercase">
                Owner
              </th>
              {['P', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'].map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-3 py-3 text-right font-display text-sm uppercase"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.team.id} className="border-t-4 border-ink">
                <th scope="row" className="px-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border-2 border-ink bg-paper">
                      {row.team.logo ? (
                        <img
                          src={row.team.logo}
                          alt=""
                          className="h-full w-full object-contain p-1"
                          loading="lazy"
                        />
                      ) : (
                        <span className="px-1 text-center font-display text-sm uppercase leading-none">
                          {getInitials(row.team) || '?'}
                        </span>
                      )}
                    </div>
                    <span className="truncate font-black uppercase" title={row.team.name}>
                      {row.team.name}
                    </span>
                  </div>
                </th>
                <td className="px-3 py-3">
                  <OwnerTag owner={row.team.owner} />
                </td>
                <td className="px-3 py-3 text-right font-black">{row.played}</td>
                <td className="px-3 py-3 text-right font-black">{row.won}</td>
                <td className="px-3 py-3 text-right font-black">{row.drawn}</td>
                <td className="px-3 py-3 text-right font-black">{row.lost}</td>
                <td className="px-3 py-3 text-right font-black">{row.goalsFor}</td>
                <td className="px-3 py-3 text-right font-black">{row.goalsAgainst}</td>
                <td className="px-3 py-3 text-right font-black">
                  {formatGoalDifference(row.goalDifference)}
                </td>
                <td className="px-3 py-3 text-right font-display text-xl">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default GroupTable;
