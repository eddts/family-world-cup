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
      data-testid="owner-tag"
      className={cn(
        'inline-flex min-w-[4.25rem] max-w-full items-center justify-center border-2 border-ink bg-posterBlue font-body font-semibold uppercase leading-none tracking-wide text-white shadow-hardSm',
        size === 'hero' ? 'px-4 py-2 text-lg sm:text-xl' : 'px-3 py-1.5 text-[0.9rem]',
        className,
      )}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

export default OwnerTag;
