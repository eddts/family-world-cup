import { getStageLabel } from '../domain/formatting';
import type { Match, Stage } from '../domain/types';
import { MatchCard } from './MatchCard';

type KnockoutStageProps = {
  matches: readonly Match[];
  title?: string;
  emptyMessage?: string;
  className?: string;
};

const knockoutStages: Stage[] = [
  'round-of-32',
  'round-of-16',
  'quarter-final',
  'semi-final',
  'third-place',
  'final',
];

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ');
}

function getMatchesForStage(matches: readonly Match[], stage: Stage) {
  return matches
    .filter((match) => match.stage === stage)
    .sort((left, right) => Date.parse(left.kickoff) - Date.parse(right.kickoff));
}

export function KnockoutStage({
  matches,
  title = 'Knockout',
  emptyMessage = 'Knockout fixtures will appear here.',
  className,
}: KnockoutStageProps) {
  const knockoutMatches = matches.filter((match) => match.stage !== 'group');

  return (
    <section className={classNames('text-ink', className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-4xl uppercase leading-none sm:text-5xl">
          {title}
        </h2>
        <span className="border-4 border-ink bg-posterRed px-3 py-2 font-display text-lg uppercase leading-none text-white shadow-hardSm">
          {knockoutMatches.length} matches
        </span>
      </div>

      {knockoutMatches.length === 0 ? (
        <p className="mt-4 border-4 border-ink bg-white p-4 font-black uppercase shadow-hard">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-5 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
          {knockoutStages.map((stage) => {
            const stageMatches = getMatchesForStage(matches, stage);

            return (
              <div key={stage} className="min-w-0">
                <h3 className="mb-4 inline-flex border-4 border-ink bg-posterYellow px-3 py-2 font-display text-2xl uppercase leading-none shadow-hardSm">
                  {getStageLabel(stage)}
                </h3>
                {stageMatches.length > 0 ? (
                  <div className="space-y-4">
                    {stageMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                ) : (
                  <p className="border-4 border-ink bg-white p-4 text-sm font-black uppercase shadow-hardSm">
                    Fixtures TBC
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default KnockoutStage;
