import { cn } from '../lib/classNames';

type OwnerTagProps = {
  owner?: string;
  className?: string;
  size?: 'default' | 'hero';
};

export function OwnerTag({ owner, className, size = 'default' }: OwnerTagProps) {
  const label = owner?.trim() || 'Unassigned';

  return (
    <span
      className={cn(
        'inline-flex w-fit max-w-full items-center border-2 border-ink bg-posterBlue font-display uppercase leading-none text-white shadow-hardSm',
        size === 'hero' ? 'px-3 py-1.5 text-sm sm:text-base' : 'px-2 py-1 text-xs',
        className,
      )}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

export default OwnerTag;
