import { useTranslation } from 'react-i18next';
import type { Profile } from '@/api/public-portfolio/schema';
import { MicroservicesIso } from '@/components/illustrations/microservices-iso';
import { SECTION_IDS } from '@/components/layout/site-header';
import { LinkButton } from '@/components/ui/button';
import { ArrowRightIcon } from '@/components/ui/icons';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { ProfileAvatar } from '@/components/ui/profile-avatar';

export function HeroSection({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const photoAlt = profile.photoUrl
    ? t('hero.photoAlt', { name: profile.fullName })
    : t('hero.photoPlaceholder', { name: profile.fullName });

  return (
    <section
      aria-labelledby="hero-title"
      className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(500px,100%),1fr))] items-center gap-8 px-4 pt-10 pb-10 sm:px-6 sm:pt-14"
    >
      <div className="flex min-w-0 flex-col gap-7">
        <div className="flex flex-wrap items-center gap-4">
          <ProfileAvatar photoUrl={profile.photoUrl} alt={photoAlt} />
          <div className="flex flex-col gap-2">
            <p className="m-0 text-lg font-bold tracking-[-0.01em]">{profile.fullName}</p>
            <div className="flex flex-wrap items-center gap-2.5 font-mono text-[13px] text-ink-muted">
              <span className="inline-flex items-center gap-2 rounded-pill border border-ink bg-surface px-3 py-1.5 text-ink">
                <span aria-hidden="true" className="size-2 rounded-full bg-success" />
                {profile.role}
              </span>
              <span>{profile.location}</span>
            </div>
          </div>
        </div>
        <h1
          id="hero-title"
          className="m-0 text-[clamp(44px,6.2vw,92px)] leading-[0.96] font-bold tracking-[-0.035em] text-balance"
        >
          {t('hero.titleBefore')} <span className="serif-accent text-cobalt">{t('hero.titleHighlight')}</span>{' '}
          {t('hero.titleAfter')}
        </h1>
        <p className="m-0 max-w-[560px] text-[clamp(17px,1.4vw,20px)] leading-[1.55] text-pretty text-ink-soft">
          {profile.intro}
        </p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href={`#${SECTION_IDS.projects}`} size="lg" iconRight={<ArrowRightIcon />}>
            {t('hero.ctaProjects')}
          </LinkButton>
          <LinkButton href={`#${SECTION_IDS.contact}`} size="lg" variant="secondary">
            {t('hero.ctaContact')}
          </LinkButton>
        </div>
      </div>
      <div className="relative w-full max-w-[640px] justify-self-center">
        <MicroservicesIso label={t('hero.illustration')} animated={!reducedMotion} />
      </div>
    </section>
  );
}
