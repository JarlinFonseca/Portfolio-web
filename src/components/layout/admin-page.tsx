import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** Encabezado de pantalla del admin: miga de pan, título con contador opcional y acciones. */
export function AdminPageHeader({
  breadcrumb,
  title,
  count,
  actions,
}: {
  breadcrumb: ReactNode;
  title: string;
  count?: number;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="font-mono text-xs text-ink-muted">{breadcrumb}</div>
        <h1 className="m-0 flex items-baseline gap-2.5 text-[clamp(32px,3.4vw,42px)] leading-none font-bold tracking-[-0.03em]">
          {title}
          {count !== undefined && (
            <span className="font-mono text-base font-normal text-ink-muted">{count}</span>
          )}
        </h1>
      </div>
      {actions && <div className="flex flex-wrap gap-2.5">{actions}</div>}
    </header>
  );
}

/** Tarjeta con borde del admin. */
export function AdminCard({
  title,
  aside,
  className,
  children,
  labelledBy,
}: {
  title?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={cn(
        'flex min-w-0 flex-col gap-5 rounded-card border-[1.5px] border-ink bg-surface p-5 sm:p-6',
        className,
      )}
    >
      {(title || aside) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {title && (
            <h2 id={labelledBy} className="m-0 text-[21px] font-bold tracking-[-0.01em]">
              {title}
            </h2>
          )}
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

/** Estado de carga o error de una pantalla del admin. */
export function AdminStatus({
  state,
  message,
  retryLabel,
  onRetry,
}: {
  state: 'loading' | 'error';
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role={state === 'error' ? 'alert' : 'status'}
      className="flex flex-col items-start gap-3 rounded-card border-[1.5px] border-dashed border-line-strong p-8 text-ink-muted"
    >
      <p className="m-0">{message}</p>
      {state === 'error' && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="font-semibold text-cobalt underline underline-offset-4"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}
