import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Lang } from '@/api/public-portfolio/schema';

/**
 * Respaldo de la CloudFront Function: "/" → /es o /en según la cookie `lang` o el idioma del navegador.
 * Es el único lugar (junto con el borde) donde se detecta el idioma del navegador.
 */
export function detectLang(cookie: string, languages: readonly string[]): Lang {
  const fromCookie = /(?:^|;\s*)lang=(es|en)/.exec(cookie)?.[1];
  if (fromCookie === 'es' || fromCookie === 'en') return fromCookie;
  return languages[0]?.toLowerCase().startsWith('en') ? 'en' : 'es';
}

export default function RootRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    void navigate(`/${detectLang(document.cookie, navigator.languages)}${window.location.hash}`, {
      replace: true,
    });
  }, [navigate]);
  return <div className="bg-dots min-h-screen" aria-busy="true" />;
}
