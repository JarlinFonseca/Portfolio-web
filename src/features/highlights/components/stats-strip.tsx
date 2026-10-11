import { useTranslation } from 'react-i18next';
import type { Stat } from '@/api/public-portfolio/schema';

/** Franja de cifras de impacto; no se renderiza si no hay cifras visibles. */
export function StatsStrip({ stats }: { stats: Stat[] }) {
  const { t } = useTranslation();
  if (stats.length === 0) return null;
  return (
    <section aria-label={t('stats.label')} className="mx-auto max-w-[1280px] px-4 pt-2 pb-[72px] sm:px-6">
      <StatsGrid stats={stats} />
    </section>
  );
}

export function StatsGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] overflow-hidden rounded-3xl border-[1.5px] border-ink bg-surface">
      {stats.map((s) => (
        <div
          key={s.id}
          className="-mr-px -mb-px flex flex-col-reverse gap-2 border-r border-b border-line px-7 pt-7 pb-[30px]"
        >
          <dt className="text-[15px] leading-[1.45] text-ink-muted">{s.label}</dt>
          <dd className="m-0 text-[clamp(38px,3.6vw,52px)] leading-none font-bold tracking-[-0.03em]">
            {s.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
