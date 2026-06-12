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

      <div className="overflow-x-auto">
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
