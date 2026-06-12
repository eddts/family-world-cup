type OwnerTagProps = {
  owner?: string;
  className?: string;
};

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function OwnerTag({ owner, className }: OwnerTagProps) {
  const label = owner?.trim() || 'Unassigned';

  return (
    <span
      className={classNames(
        'inline-flex max-w-full items-center border-2 border-ink bg-posterYellow px-2 py-1 font-display text-xs uppercase leading-none text-ink shadow-hardSm',
        className,
      )}
      title={label}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

export default OwnerTag;
