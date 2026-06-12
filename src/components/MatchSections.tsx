import { groupMatchesByDate } from '../domain/tournament';
import type { Match } from '../domain/types';
import { MatchCard } from './MatchCard';

type MatchSectionsProps = {
  title: string;
  matches: readonly Match[];
  emptyMessage?: string;
  className?: string;
};

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function MatchSections({
  title,
  matches,
  emptyMessage = 'No matches to show yet.',
  className,
}: MatchSectionsProps) {
  const groupedMatches = groupMatchesByDate(
    [...matches].sort((left, right) => Date.parse(left.kickoff) - Date.parse(right.kickoff)),
  );

  return (
    <section className={classNames('text-ink', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-4xl uppercase leading-none sm:text-5xl">
          {title}
        </h2>
        <span className="border-4 border-ink bg-posterYellow px-3 py-2 font-display text-lg uppercase leading-none shadow-hardSm">
          {matches.length} matches
        </span>
      </div>

      {groupedMatches.length === 0 ? (
        <p className="mt-4 border-4 border-ink bg-white p-4 font-black uppercase shadow-hard">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-5 space-y-8">
          {groupedMatches.map((group) => (
            <div key={group.label}>
              <h3 className="mb-4 inline-flex border-4 border-ink bg-posterBlue px-3 py-2 font-display text-2xl uppercase leading-none text-white shadow-hardSm">
                {group.label}
              </h3>
              <div className="grid gap-4 xl:grid-cols-2">
                {group.matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default MatchSections;
