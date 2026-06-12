import {
  formatKickoff,
  getMatchScore,
  getStageLabel,
  getStatusLabel,
} from '../domain/formatting';
import type { Match } from '../domain/types';
import { cn } from '../lib/classNames';
import { TeamBadge } from './TeamBadge';

type MatchCardProps = {
  match: Match;
  className?: string;
  emphasis?: 'standard' | 'knockout' | 'final';
};

function getMatchLabel(match: Match) {
  if (match.stage === 'group' && match.group) {
    return `Group ${match.group}`;
  }

  return getStageLabel(match.stage);
}

function getStatusClasses(match: Match) {
  if (match.status === 'live') return 'bg-posterRed text-white';
  if (match.status === 'finished') return 'bg-ink text-paper';
  return 'bg-posterBlue text-white';
}

function getScoreClasses(emphasis: MatchCardProps['emphasis']) {
  if (emphasis === 'final') {
    return 'min-w-[6.75rem] bg-white px-4 py-3 text-5xl text-posterRed sm:min-w-[8rem] sm:text-6xl';
  }

  if (emphasis === 'knockout') {
    return 'min-w-[5.5rem] bg-posterYellow px-3 py-2 text-4xl sm:min-w-[6.5rem] sm:text-5xl';
  }

  return 'min-w-[4rem] bg-posterYellow px-2 py-2 text-3xl sm:min-w-[5rem] sm:text-4xl';
}

export function MatchCard({ match, className, emphasis = 'standard' }: MatchCardProps) {
  return (
    <article
      className={cn(
        'border-4 border-ink bg-white p-3 text-ink shadow-hard sm:p-4',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-2xl uppercase leading-none">
            {getMatchLabel(match)}
          </p>
          <p className="mt-1 text-sm font-black uppercase text-ink/70">
            {match.venue || 'Venue TBC'}
          </p>
        </div>

        <span
          className={cn(
            'border-2 border-ink px-2 py-1 font-display text-sm uppercase leading-none shadow-hardSm',
            getStatusClasses(match),
          )}
        >
          {getStatusLabel(match)}
        </span>
      </div>

      <div
        data-testid="match-card-teams"
        className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]"
      >
        <TeamBadge team={match.homeTeam} className="w-full" />
        <div
          className={cn(
            'justify-self-center border-4 border-ink text-center font-display uppercase leading-none shadow-hardSm',
            getScoreClasses(emphasis),
          )}
        >
          {getMatchScore(match)}
        </div>
        <TeamBadge team={match.awayTeam} align="right" className="w-full" />
      </div>

      <p className="mt-4 border-t-4 border-ink pt-3 text-sm font-black uppercase text-ink">
        {formatKickoff(match.kickoff)}
      </p>
    </article>
  );
}

export default MatchCard;
