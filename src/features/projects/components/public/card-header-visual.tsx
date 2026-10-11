import { useTranslation } from 'react-i18next';
import type { Project } from '@/api/public-portfolio/schema';
import { LockBadge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';

const OPEN_COLORS = ['#5278e8', '#e7e9ee', '#f4855b', '#9ad1b4', '#e7e9ee', '#7aa2ff'];
const INDENTS = [6, 10, 14, 10, 14, 6];

/** Barras de "código" pseudoaleatorias pero estables por posición (mismo algoritmo del diseño). */
export function makeBars(seed: number, open: boolean) {
  let s = seed * 9301 + 49297;
  return INDENTS.map((indent, i) => {
    s = (s * 9301 + 49297) % 233280;
    return {
      x: `${indent}%`,
      y: 18 + i * 17,
      w: `${22 + Math.round((s / 233280) * 52)}%`,
      color: open ? (OPEN_COLORS[(i + seed) % OPEN_COLORS.length] ?? '#e7e9ee') : '#C5C8C0',
    };
  });
}

/** Cabecera de la tarjeta: portada (desenfocada si corresponde) o cabecera gráfica por defecto. */
export function CardHeaderVisual({
  project,
  index,
  compact = false,
}: {
  project: Pick<Project, 'type' | 'cover'>;
  index: number;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const isPrivate = project.type === 'PRIVATE';
  const height = compact ? 110 : 132;

  return (
    <div
      style={{ height }}
      className={cn(
        'relative overflow-hidden border-b-[1.5px] border-ink',
        isPrivate ? 'bg-[#e6e8e2]' : 'bg-ink',
      )}
    >
      {project.cover ? (
        <img
          src={project.cover.url}
          alt={project.cover.alt}
          loading="lazy"
          decoding="async"
          className={cn('block size-full object-cover', project.cover.blurred && 'scale-110 blur-md')}
        />
      ) : (
        <svg width="100%" height={height} aria-hidden="true" className="block">
          {makeBars(index + 3, !isPrivate).map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height="9" rx="4.5" fill={b.color} />
          ))}
        </svg>
      )}
      {isPrivate ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <LockBadge label={t('projects.nda')} />
        </div>
      ) : (
        <span className="absolute right-3.5 bottom-3 rounded-pill bg-success px-2.5 py-1.5 font-mono text-[11px] text-white">
          {t('projects.openBadge')}
        </span>
      )}
    </div>
  );
}
