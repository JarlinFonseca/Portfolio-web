import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { buttonClasses } from '@/components/ui/button';
import { ArrowLeftIcon } from '@/components/ui/icons';

/** Página 404 bilingüe (el idioma lo da el proveedor de i18n según la URL). */
export function NotFoundView() {
  const { t, i18n } = useTranslation();
  return (
    <main className="bg-dots flex min-h-screen flex-col items-start justify-center gap-6 px-6 sm:px-16">
      <title>{t('meta.notFoundTitle')}</title>
      <meta name="robots" content="noindex" />
      <span className="font-mono text-[13px] text-cobalt">{t('notFound.kicker')}</span>
      <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-none font-bold tracking-[-0.035em]">
        {t('notFound.title')}
      </h1>
      <p className="m-0 max-w-[520px] text-lg text-ink-soft">{t('notFound.text')}</p>
      <Link to={`/${i18n.language === 'en' ? 'en' : 'es'}`} className={buttonClasses('primary', 'lg')}>
        <ArrowLeftIcon />
        {t('notFound.back')}
      </Link>
    </main>
  );
}
