import { useEffect } from 'react';
import { Outlet, useParams } from 'react-router';
import { isLang } from '@/api/public-portfolio/lang';
import { NotFoundView } from '@/components/layout/not-found-view';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { SkipLink } from '@/components/layout/skip-link';
import { ResumeDownloadButton } from '@/features/contact/components/resume-download-button';
import { usePortfolio } from './use-portfolio';

const LANG_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export default function PublicLayout() {
  const params = useParams();
  const lang = isLang(params.lang) ? params.lang : null;
  const data = usePortfolio(lang ?? 'es');

  // Preferencia de idioma: la lee la CloudFront Function para redirigir "/"
  useEffect(() => {
    if (lang) document.cookie = `lang=${lang}; path=/; max-age=${LANG_COOKIE_MAX_AGE}; samesite=lax`;
  }, [lang]);

  if (!lang) return <NotFoundView />; // /fr, /de… → 404

  const fullName = data?.profile.fullName ?? 'Jarlin Fonseca';
  return (
    <div className="bg-dots min-h-screen w-full overflow-x-clip">
      <SkipLink />
      <SiteHeader
        lang={lang}
        brand="Jarlin Fonseca"
        resumeAction={<ResumeDownloadButton resumeUrl={data?.profile.resumeUrl ?? null} compact />}
      />
      <main id="contenido" tabIndex={-1} className="outline-none">
        <div id="top" />
        <Outlet />
      </main>
      <SiteFooter fullName={fullName} />
    </div>
  );
}
