import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { LANGS, type Lang } from '@/api/public-portfolio/lang';
import { cn } from '@/utils/cn';

/**
 * Enlaces reales a /es y /en que conservan la sección actual (hash).
 * Como ambas rutas están pre-renderizadas, el cambio no recarga la página.
 */
export function LanguageSwitch({ current }: { current: Lang }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <nav aria-label={t('a11y.language')}>
      <ul className="m-0 flex list-none rounded-pill border border-ink bg-surface p-[3px]">
        {LANGS.map((lang) => {
          const active = lang === current;
          return (
            <li key={lang}>
              <Link
                to={`/${lang}`}
                lang={lang}
                hrefLang={lang}
                aria-current={active ? 'true' : undefined}
                aria-label={t(`lang.${lang}`)}
                preventScrollReset
                onClick={(event) => {
                  if (active) return event.preventDefault();
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
                  event.preventDefault();
                  void navigate(`/${lang}${window.location.hash}`, { preventScrollReset: true });
                }}
                className={cn(
                  'flex h-[38px] min-w-11 items-center justify-center rounded-pill font-mono text-xs font-medium uppercase no-underline transition-colors',
                  active ? 'bg-ink text-surface hover:text-surface' : 'text-ink hover:bg-chip',
                )}
              >
                {lang}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
