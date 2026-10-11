import { useTranslation } from 'react-i18next';
import type {
  Certification,
  Education,
  Experience,
  Lang,
  SpokenLanguage,
} from '@/api/public-portfolio/schema';
import { SectionHeading } from '@/components/layout/section-heading';
import { SECTION_IDS } from '@/components/layout/site-header';
import { ExternalLink } from '@/components/ui/external-link';
import { formatRange, yearOf } from '@/utils/format-month';

function ExperienceTimeline({ items, lang }: { items: Experience[]; lang: Lang }) {
  const { t } = useTranslation();
  return (
    <ol className="m-0 list-none border-t-[1.5px] border-ink p-0">
      {items.map((job) => (
        <li
          key={job.id}
          className="grid grid-cols-[repeat(auto-fit,minmax(min(240px,100%),1fr))] gap-x-8 gap-y-3 border-b border-[#c9cbc3] py-7"
        >
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[13px] text-ink-muted">
              {formatRange(job.startMonth, job.endMonth, lang, job.current)}
            </span>
            {job.current && (
              <span className="self-start rounded-pill bg-cobalt px-2.5 py-1 font-mono text-[11px] text-white">
                {t('career.current')}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="m-0 text-2xl font-bold tracking-[-0.02em]">{job.company}</h3>
            <p className="m-0 text-base font-semibold text-cobalt">{job.role}</p>
          </div>
          <p className="m-0 text-[15.5px] leading-[1.55] text-pretty text-ink-soft">{job.summary}</p>
        </li>
      ))}
    </ol>
  );
}

function EducationCard({ items, lang }: { items: Education[]; lang: Lang }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4 rounded-[20px] bg-night p-6 text-paper">
      <h3 className="m-0 font-mono text-xs font-normal text-cobalt-light">{t('career.education')}</h3>
      <ul className="m-0 flex list-none flex-col gap-4 p-0">
        {items.map((e) => (
          <li key={e.id} className="flex flex-col gap-2.5">
            <span className="text-[22px] font-bold tracking-[-0.01em]">{e.program}</span>
            <span className="text-[15px] text-night-text">
              {e.institution}
              {(e.startMonth || e.endMonth) && ` · ${formatYears(e.startMonth, e.endMonth, lang)}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const formatYears = (start: string | null, end: string | null, lang: Lang) => {
  const s = yearOf(start);
  const e = yearOf(end);
  if (s && e) return s === e ? s : `${s} – ${e}`;
  return s || e || formatRange(start, end, lang);
};

function CertificationList({ items }: { items: Certification[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border-[1.5px] border-ink bg-surface p-6">
      <h3 className="m-0 font-mono text-xs font-normal text-ink-muted">{t('career.certifications')}</h3>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {items.map((c) => (
          <li key={c.id} className="flex justify-between gap-3 text-[15px]">
            {c.credentialUrl ? (
              <ExternalLink
                href={c.credentialUrl}
                className="font-semibold underline underline-offset-4 hover:text-cobalt"
              >
                {c.name}
              </ExternalLink>
            ) : (
              <span className="font-semibold">{c.name}</span>
            )}
            <span className="font-mono text-xs whitespace-nowrap text-ink-muted">
              {c.issuer}
              {c.issuedMonth && ` · ${yearOf(c.issuedMonth)}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LanguageList({ items }: { items: SpokenLanguage[] }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border-[1.5px] border-ink bg-surface p-6">
      <h3 className="m-0 font-mono text-xs font-normal text-ink-muted">{t('career.languages')}</h3>
      <dl className="m-0 flex flex-col gap-3">
        {items.map((l) => (
          <div key={l.id} className="flex justify-between gap-3 text-[15px]">
            <dt className="font-semibold">{l.name}</dt>
            <dd className="m-0 font-mono text-xs text-ink-muted">{t(`career.level.${l.level}`)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CareerSection({
  lang,
  experience,
  education,
  certifications,
  languages,
}: {
  lang: Lang;
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  languages: SpokenLanguage[];
}) {
  const { t } = useTranslation();
  const hasCards = education.length + certifications.length + languages.length > 0;
  return (
    <section
      id={SECTION_IDS.career}
      aria-labelledby="career-title"
      className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 pt-8 pb-[104px] sm:px-6"
    >
      <SectionHeading
        id="career-title"
        className="max-w-[720px]"
        kicker={t('career.kicker')}
        before={t('career.titleBefore')}
        highlight={t('career.titleHighlight')}
      />
      {experience.length > 0 && <ExperienceTimeline items={experience} lang={lang} />}
      {hasCards && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(280px,100%),1fr))] gap-4">
          {education.length > 0 && <EducationCard items={education} lang={lang} />}
          {certifications.length > 0 && <CertificationList items={certifications} />}
          {languages.length > 0 && <LanguageList items={languages} />}
        </div>
      )}
    </section>
  );
}
