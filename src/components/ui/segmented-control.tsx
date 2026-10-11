import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  count?: number;
}

/**
 * Grupo de botones con aria-pressed (filtros).
 * `appearance="pills"` = botones separados del sitio público; `"tabs"` = control compacto del admin.
 */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  appearance = 'pills',
  className,
}: {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  appearance?: 'pills' | 'tabs';
  className?: string;
}) {
  const pills = appearance === 'pills';
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'flex flex-wrap',
        pills ? 'gap-2' : 'gap-1 rounded-[14px] border border-line-strong bg-surface p-1',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-semibold transition-colors',
              pills
                ? 'rounded-pill border-[1.5px] border-ink px-[18px] text-sm'
                : 'rounded-[10px] px-3.5 text-[15px]',
              active
                ? 'bg-ink text-surface'
                : pills
                  ? 'bg-surface text-ink hover:bg-white'
                  : 'text-ink hover:bg-chip',
            )}
          >
            {opt.label}
            {opt.count !== undefined && <span className="font-mono text-xs opacity-70">{opt.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
