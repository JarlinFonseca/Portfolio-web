import { useTranslation } from 'react-i18next';

export function SkipLink({ target = 'contenido' }: { target?: string }) {
  const { t } = useTranslation();
  return (
    <a
      href={`#${target}`}
      className="sr-only z-50 rounded-pill bg-ink px-5 py-3 font-semibold text-surface no-underline focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      {t('a11y.skipToContent')}
    </a>
  );
}
