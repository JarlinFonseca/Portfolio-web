import { data as routeData } from 'react-router';
import { isLang, parseLang } from '@/api/public-portfolio/lang';
import { buildHomeMeta } from '@/components/seo/meta';
import { CareerSection } from '@/features/career/components/career-section';
import { ContactSection } from '@/features/contact/components/contact-section';
import { HeroSection } from '@/features/hero/components/hero-section';
import { HowIWorkSection } from '@/features/highlights/components/how-i-work-section';
import { StatsStrip } from '@/features/highlights/components/stats-strip';
import { ProjectsSection } from '@/features/projects/components/public/projects-section';
import { StackSection } from '@/features/stack/components/stack-section';
import type { Route } from './+types/home';
import { usePortfolio } from './use-portfolio';

/** Corre en el build (pre-render de /es y /en) con la fuente configurada. */
export async function loader({ params }: Route.LoaderArgs) {
  const lang = parseLang(params.lang);
  const { createPortfolioSource } = await import('@/api/public-portfolio/source');
  return createPortfolioSource().getPortfolio(lang);
}

/** En el navegador: un idioma inválido es 404 sin pedir datos; uno válido usa el .data pre-renderizado. */
export async function clientLoader({ params, serverLoader }: Route.ClientLoaderArgs) {
  if (!isLang(params.lang)) throw routeData(null, { status: 404 });
  return serverLoader();
}

export function meta({ loaderData }: Route.MetaArgs) {
  return loaderData ? buildHomeMeta(loaderData) : [];
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const data = usePortfolio(loaderData.lang) ?? loaderData;
  return (
    <>
      <HeroSection profile={data.profile} />
      <StatsStrip stats={data.stats} />
      <ProjectsSection projects={data.projects} />
      <HowIWorkSection principles={data.principles} />
      <StackSection stack={data.stack} />
      <CareerSection
        lang={data.lang}
        experience={data.experience}
        education={data.education}
        certifications={data.certifications}
        languages={data.languages}
      />
      <ContactSection profile={data.profile} />
    </>
  );
}
