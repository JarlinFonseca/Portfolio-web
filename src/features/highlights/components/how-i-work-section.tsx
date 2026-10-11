import { useTranslation } from 'react-i18next';
import type { Principle } from '@/api/public-portfolio/schema';
import { DevAtDeskIso } from '@/components/illustrations/dev-at-desk-iso';
import { SectionHeading } from '@/components/layout/section-heading';
import { SECTION_IDS } from '@/components/layout/site-header';

export function HowIWorkSection({ principles }: { principles: Principle[] }) {
  const { t } = useTranslation();
  return (
    <section id={SECTION_IDS.how} aria-labelledby="how-title" className="bg-night text-paper">
      <div className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(480px,100%),1fr))] items-center gap-12 px-4 py-20 sm:px-6 sm:py-24">
        <div className="overflow-hidden rounded-[28px] bg-paper p-3">
          <DevAtDeskIso label={t('how.illustration')} />
        </div>
        <div className="flex flex-col gap-8">
          <SectionHeading
            id="how-title"
            tone="dark"
            kicker={t('how.kicker')}
            before={t('how.titleBefore')}
            highlight={t('how.titleHighlight')}
          />
          {principles.length > 0 && (
            <ol className="m-0 flex list-none flex-col p-0">
              {principles.map((p, i) => (
                <li key={p.id} className="flex gap-5 border-t border-night-line py-5">
                  <span
                    aria-hidden="true"
                    className="min-w-6 pt-[5px] font-mono text-[13px] text-signal-light"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="m-0 text-[21px] font-semibold tracking-[-0.01em]">{p.title}</h3>
                    <p className="m-0 text-[15.5px] leading-[1.55] text-night-text">{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
