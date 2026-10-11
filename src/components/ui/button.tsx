import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/utils/cn';

export type ButtonVariant =
  'primary' | 'cobalt' | 'secondary' | 'ghost' | 'danger' | 'inverse' | 'outline-light';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'lift inline-flex items-center justify-center gap-2.5 rounded-pill font-semibold no-underline whitespace-nowrap disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-ink text-surface hover:bg-[#23262c] hover:text-surface',
  cobalt: 'bg-cobalt text-white hover:bg-cobalt-deep hover:text-white',
  secondary: 'border-[1.5px] border-ink bg-surface text-ink hover:text-ink',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-danger text-white hover:bg-[#9a3916] hover:text-white',
  inverse: 'bg-white text-ink hover:text-ink',
  'outline-light': 'border-[1.5px] border-white text-white hover:bg-white/10 hover:text-white',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-11 px-4 text-sm',
  md: 'min-h-11 px-5 text-[15px]',
  lg: 'min-h-[54px] px-[26px] text-base',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

type CommonProps = { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode; iconRight?: ReactNode };

export function Button({
  variant,
  size,
  icon,
  iconRight,
  className,
  children,
  type = 'button',
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

/** Enlace con aspecto de botón: siempre un <a> real. */
export function LinkButton({
  variant,
  size,
  icon,
  iconRight,
  className,
  children,
  ...props
}: CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {children}
      {iconRight}
    </a>
  );
}

export function RouterLinkButton({
  variant,
  size,
  icon,
  iconRight,
  className,
  children,
  ...props
}: CommonProps & LinkProps) {
  return (
    <Link className={buttonClasses(variant, size, className)} {...props}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
