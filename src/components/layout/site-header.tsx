import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Lang } from '@/api/public-portfolio/schema';
import { LanguageSwitch } from './language-switch';

export const SECTION_IDS = {
  projects: 'proyectos',
  how: 'como-trabajo',
  stack: 'stack',
  career: 'trayectoria',
  contact: 'contacto',
} as const;

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-xl bg-ink text-base font-extrabold tracking-[-0.02em] text-paper"
    >
      JF
    </span>
  );
}

/** Menú fijo con anclas, selector de idioma y botón de HV (en < 900 px se ocultan los enlaces). */
export function SiteHeader({
  lang,
  brand,
  resumeAction,
}: {
  lang: Lang;
  brand: string;
  resumeAction: ReactNode;
}) {
  const { t } = useTranslation();
  const links = [
    { id: SECTION_IDS.projects, label: t('nav.projects') },
    { id: SECTION_IDS.how, label: t('nav.how') },
    { id: SECTION_IDS.stack, label: t('nav.stack') },
    { id: SECTION_IDS.career, label: t('nav.career') },
    { id: SECTION_IDS.contact, label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <a
          href="#top"
          className="flex items-center gap-2.5 no-underline hover:text-ink"
          aria-label={`${brand} — ${t('a11y.home')}`}
        >
          <BrandMark />
          <span className="text-[17px] font-bold tracking-[-0.01em] max-[560px]:hidden">{brand}</span>
        </a>
        <nav aria-label={t('a11y.mainNav')} className="max-[900px]:hidden">
          <ul className="m-0 flex list-none items-center gap-7 p-0 text-[15px]">
            {links.map((link) => (
              <li key={link.id}>
                <a href={`#${link.id}`} className="no-underline hover:text-cobalt">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2.5">
          <LanguageSwitch current={lang} />
          {resumeAction}
        </div>
      </div>
    </header>
  );
}
