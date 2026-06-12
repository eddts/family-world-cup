import {
  formatKickoff,
  getMatchScore,
  getStageLabel,
  getStatusLabel,
} from '../domain/formatting';
import type { Match } from '../domain/types';
import { TeamBadge } from './TeamBadge';

type MatchCardProps = {
  match: Match;
  className?: string;
};

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ');
}

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

export function MatchCard({ match, className }: MatchCardProps) {
  return (
    <article
      className={classNames(
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
          className={classNames(
            'border-2 border-ink px-2 py-1 font-display text-sm uppercase leading-none shadow-hardSm',
            getStatusClasses(match),
          )}
        >
          {getStatusLabel(match)}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
        <TeamBadge team={match.homeTeam} />
        <div className="min-w-[4rem] border-4 border-ink bg-posterYellow px-2 py-2 text-center font-display text-3xl uppercase leading-none text-ink shadow-hardSm sm:min-w-[5rem] sm:text-4xl">
          {getMatchScore(match)}
        </div>
        <TeamBadge team={match.awayTeam} align="right" />
      </div>

      <p className="mt-4 border-t-4 border-ink pt-3 text-sm font-black uppercase text-ink">
        {formatKickoff(match.kickoff)}
      </p>
    </article>
  );
}

export default MatchCard;
