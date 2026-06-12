import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/classNames';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className, type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-[2.75rem] items-center justify-center border-4 border-ink bg-ink px-4 py-2 font-display text-base uppercase leading-none text-white shadow-[6px_6px_0_#0057b8] transition duration-150 hover:-translate-y-0.5 hover:bg-posterBlue hover:shadow-[8px_8px_0_#ef3340] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-posterYellow active:translate-x-1 active:translate-y-1 active:bg-posterRed active:shadow-[2px_2px_0_#0057b8] disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-ink/50 disabled:bg-ink/35 disabled:text-ink/60 disabled:shadow-none',
        className,
      )}
      {...props}
    />
  );
}

export default Button;
