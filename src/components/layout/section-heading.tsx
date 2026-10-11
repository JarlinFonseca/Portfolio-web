import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/** Kicker mono + título con la parte destacada en serif itálica, como en el diseño. */
export function SectionHeading({
  id,
  kicker,
  before,
  highlight,
  lead,
  tone = 'light',
  size = 'md',
  className,
}: {
  id?: string;
  kicker: string;
  before: string;
  highlight: string;
  lead?: ReactNode;
  tone?: 'light' | 'dark';
  size?: 'md' | 'lg';
  className?: string;
}) {
  const dark = tone === 'dark';
  return (
    <div className={cn('flex flex-col gap-3.5', className)}>
      <span className={cn('font-mono text-[13px]', dark ? 'text-cobalt-light' : 'text-cobalt')}>
        {kicker}
      </span>
      <h2
        id={id}
        className={cn(
          'm-0 font-bold tracking-[-0.03em] text-balance',
          size === 'lg'
            ? 'text-[clamp(36px,4.4vw,64px)] leading-none'
            : 'text-[clamp(34px,4vw,58px)] leading-[1.02]',
        )}
      >
        {before} <span className={cn('serif-accent', dark && 'text-cobalt-light')}>{highlight}</span>
      </h2>
      {lead && (
        <p className="m-0 max-w-[720px] text-[17px] leading-[1.55] text-pretty text-ink-soft">{lead}</p>
      )}
    </div>
  );
}
