import {
  formatKickoff,
  getMatchScore,
  getStageLabel,
  getStatusLabel,
} from '../domain/formatting';
import type { Match } from '../domain/types';
import { cn } from '../lib/classNames';
import { TeamBadge } from './TeamBadge';

type NextMatchHeroProps = {
  match?: Match;
  className?: string;
};

function getMatchLabel(match: Match) {
  if (match.stage === 'group' && match.group) {
    return `Group ${match.group}`;
  }

  return getStageLabel(match.stage);
}

export function NextMatchHero({ match, className }: NextMatchHeroProps) {
  if (!match) {
    return (
      <section
        className={cn(
          'border-4 border-ink bg-posterBlue p-5 text-white shadow-hard sm:p-8',
          className,
        )}
      >
        <p className="font-display text-2xl uppercase leading-none text-posterYellow">
          Next match
        </p>
        <h2 className="mt-3 font-display text-5xl uppercase leading-none sm:text-7xl">
          No fixture loaded
        </h2>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'border-4 border-ink bg-posterRed p-5 text-white shadow-hard sm:p-8',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-2xl uppercase leading-none text-posterYellow">
            Next match
          </p>
          <h2 className="mt-2 font-display text-5xl uppercase leading-none sm:text-7xl">
            {getMatchLabel(match)}
          </h2>
        </div>
        <span className="border-4 border-ink bg-posterYellow px-3 py-2 font-display text-xl uppercase leading-none text-ink shadow-hardSm">
          {getStatusLabel(match)}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 items-center gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <TeamBadge
          team={match.homeTeam}
          className="items-start sm:items-center"
          markClassName="h-14 w-14 sm:h-12 sm:w-12"
          nameClassName="text-2xl sm:text-4xl"
          ownerTagSize="hero"
        />
        <div className="justify-self-center border-4 border-ink bg-posterYellow px-5 py-3 text-center font-display text-6xl uppercase leading-none text-ink shadow-hard sm:text-8xl">
          {getMatchScore(match)}
        </div>
        <TeamBadge
          team={match.awayTeam}
          align="right"
          className="items-start justify-end sm:items-center"
          markClassName="h-14 w-14 sm:h-12 sm:w-12"
          nameClassName="text-2xl sm:text-4xl"
          ownerTagSize="hero"
        />
      </div>

      <div className="mt-8 grid gap-3 border-t-4 border-ink pt-4 text-sm font-black uppercase sm:grid-cols-2">
        <p className="min-w-0 break-words [overflow-wrap:anywhere]">
          {match.venue || 'Venue TBC'}
        </p>
        <p className="min-w-0 break-words [overflow-wrap:anywhere] sm:text-right">
          {formatKickoff(match.kickoff)}
        </p>
      </div>
    </section>
  );
}

export default NextMatchHero;
