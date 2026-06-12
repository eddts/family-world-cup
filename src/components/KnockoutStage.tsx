import { getStageLabel } from '../domain/formatting';
import type { Match, Stage } from '../domain/types';
import { cn } from '../lib/classNames';
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
];

function getMatchesForStage(matches: readonly Match[], stage: Stage) {
  return matches
    .filter((match) => match.stage === stage)
    .sort((left, right) => Date.parse(left.kickoff) - Date.parse(right.kickoff));
}

function getHeadingClasses(stage: Stage) {
  if (stage === 'semi-final') {
    return 'mb-4 inline-flex border-4 border-ink bg-white px-3 py-2 font-display text-3xl uppercase leading-none text-ink shadow-hardSm';
  }

  return 'mb-4 inline-flex border-4 border-ink bg-posterYellow px-3 py-2 font-display text-2xl uppercase leading-none text-ink shadow-hardSm';
}

function getMatchEmphasis(stage: Stage) {
  if (stage === 'final') return 'final';
  if (stage !== 'round-of-32' && stage !== 'round-of-16') return 'knockout';
  return 'standard';
}

function getRoundBandClasses(stage: Stage) {
  if (stage === 'semi-final') {
    return 'border-4 border-ink bg-posterBlue p-4 text-white shadow-hard';
  }

  if (stage === 'quarter-final') {
    return 'border-4 border-ink bg-white p-4 shadow-hard';
  }

  return 'border-4 border-ink bg-paper p-4 shadow-hard';
}

function getMatchGridClasses(stage: Stage) {
  if (stage === 'third-place' || stage === 'final') return 'grid gap-4';
  if (stage === 'quarter-final') return 'grid gap-4 lg:grid-cols-2';
  if (stage === 'semi-final') return 'grid gap-4 lg:grid-cols-2';
  return 'grid gap-4 lg:grid-cols-2';
}

function renderMatchList(matches: readonly Match[], stage: Stage) {
  if (matches.length === 0) {
    return (
      <p className="border-4 border-ink bg-white p-4 text-sm font-black uppercase text-ink shadow-hardSm">
        Fixtures TBC
      </p>
    );
  }

  return (
    <div className={getMatchGridClasses(stage)}>
      {matches.map((match) => (
        <MatchCard key={match.id} match={match} emphasis={getMatchEmphasis(stage)} />
      ))}
    </div>
  );
}

export function KnockoutStage({
  matches,
  title = 'Knockout',
  emptyMessage = 'Knockout fixtures will appear here.',
  className,
}: KnockoutStageProps) {
  const knockoutMatches = matches.filter((match) => match.stage !== 'group');

  return (
    <section className={cn('text-ink', className)}>
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
        <div data-testid="knockout-round-list" className="mt-6 space-y-8">
          {knockoutStages.map((stage) => {
            const stageMatches = getMatchesForStage(matches, stage);

            return (
              <div key={stage} className={getRoundBandClasses(stage)}>
                <h3 className={getHeadingClasses(stage)}>
                  {getStageLabel(stage)}
                </h3>
                {renderMatchList(stageMatches, stage)}
              </div>
            );
          })}
          <div
            data-testid="final-weekend"
            className="border-4 border-ink bg-posterRed p-4 text-white shadow-hard"
          >
            <h3 className="mb-5 inline-flex border-4 border-ink bg-posterYellow px-4 py-3 font-display text-4xl uppercase leading-none text-ink shadow-hardSm sm:text-5xl">
              Third place / Final
            </h3>
            <div className="grid gap-5">
              <div className="border-4 border-ink bg-posterBlue p-4 shadow-hardSm">
                <h3 className="mb-4 inline-flex border-4 border-ink bg-white px-3 py-2 font-display text-3xl uppercase leading-none text-ink shadow-hardSm">
                  {getStageLabel('third-place')}
                </h3>
                {renderMatchList(getMatchesForStage(matches, 'third-place'), 'third-place')}
              </div>
              <div className="border-4 border-ink bg-posterYellow p-4 text-ink shadow-hard">
                <h3 className="mb-4 inline-flex border-4 border-ink bg-white px-4 py-3 font-display text-5xl uppercase leading-none text-posterRed shadow-hardSm sm:text-6xl">
                  {getStageLabel('final')}
                </h3>
                {renderMatchList(getMatchesForStage(matches, 'final'), 'final')}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default KnockoutStage;
