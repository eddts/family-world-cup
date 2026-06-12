import type { TeamRef } from '../domain/types';
import { cn } from '../lib/classNames';
import { OwnerTag } from './OwnerTag';

type TeamBadgeProps = {
  team: TeamRef;
  align?: 'left' | 'right';
  className?: string;
  markClassName?: string;
  nameClassName?: string;
  ownerTagSize?: 'default' | 'hero';
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

export function TeamBadge({
  team,
  align = 'left',
  className,
  markClassName,
  nameClassName,
  ownerTagSize = 'default',
}: TeamBadgeProps) {
  const isRightAligned = align === 'right';
  const initials = getInitials(team);

  return (
    <div
      className={cn(
        'flex min-w-0 items-center gap-3',
        isRightAligned && 'flex-row-reverse text-right',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border-4 border-ink bg-white shadow-hardSm',
          markClassName,
        )}
      >
        {team.logo ? (
          <img
            src={team.logo}
            alt=""
            className="h-full w-full object-contain p-1"
            loading="lazy"
          />
        ) : (
          <span className="px-1 text-center font-display text-base uppercase leading-none text-ink">
            {initials || '?'}
          </span>
        )}
      </div>

      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col',
          isRightAligned && 'items-end',
        )}
      >
        <span
          className={cn(
            'max-w-full truncate font-display text-xl uppercase leading-none text-ink',
            nameClassName,
          )}
          title={team.name}
        >
          {team.name}
        </span>
        {!team.placeholder && (
          <OwnerTag
            owner={team.owner}
            size={ownerTagSize}
            className={cn('mt-2 max-w-full', isRightAligned ? 'self-end' : 'self-start')}
          />
        )}
      </div>
    </div>
  );
}

export default TeamBadge;
