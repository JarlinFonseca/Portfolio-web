import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { LockIcon } from './icons';

type Tone = 'ink' | 'cobalt' | 'success' | 'signal' | 'success-soft' | 'neutral';

const tones: Record<Tone, string> = {
  ink: 'bg-ink text-surface',
  cobalt: 'bg-cobalt text-white',
  success: 'bg-success text-white',
  signal: 'bg-signal text-ink',
  'success-soft': 'bg-[#e1efe7] text-[#1f5a40]',
  neutral: 'bg-chip text-ink',
};

export function Badge({
  tone = 'ink',
  icon,
  className,
  children,
}: {
  tone?: Tone;
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 font-mono text-[11px] leading-none whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Candado con texto visible: el ícono es decorativo. */
export function LockBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 rounded-pill bg-ink py-2.5 pr-4 pl-3 text-surface',
        className,
      )}
    >
      <LockIcon />
      <span className="font-mono text-xs">{label}</span>
    </span>
  );
}

/** Etiqueta de tecnología. */
export function TechTag({ children, tone = 'outline' }: { children: ReactNode; tone?: 'outline' | 'soft' }) {
  return (
    <span
      className={cn(
        'rounded-lg font-mono text-ink',
        tone === 'outline'
          ? 'border border-line-strong bg-white px-2.5 py-[5px] text-xs'
          : 'bg-chip px-2.5 py-1.5 text-[12.5px]',
      )}
    >
      {children}
    </span>
  );
}
