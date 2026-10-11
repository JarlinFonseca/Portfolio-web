import { useTranslation } from 'react-i18next';
import type { Profile } from '@/api/public-portfolio/schema';
import { SECTION_IDS } from '@/components/layout/site-header';
import { buttonClasses } from '@/components/ui/button';
import { ExternalLink } from '@/components/ui/external-link';
import { MailIcon } from '@/components/ui/icons';
import { ResumeDownloadButton } from './resume-download-button';

export function ContactSection({ profile }: { profile: Profile }) {
  const { t } = useTranslation();
  const big = 'min-h-14 px-6 text-base max-[480px]:w-full';
  return (
    <section
      id={SECTION_IDS.contact}
      aria-labelledby="contact-title"
      className="mx-auto max-w-[1280px] px-4 pb-[72px] sm:px-6"
    >
      <div className="relative flex flex-col gap-8 overflow-hidden rounded-[32px] bg-cobalt p-[clamp(28px,6vw,80px)] text-white">
        <svg
          viewBox="0 0 200 200"
          width="220"
          height="220"
          aria-hidden="true"
          className="absolute -top-[30px] -right-[30px] opacity-90 max-[480px]:size-[140px]"
        >
          <g className="motion-safe:animate-float">
            <polygon points="100,30 160,65 100,100 40,65" fill="#5278e8" stroke="#14161a" strokeWidth="1.5" />
            <polygon
              points="40,65 100,100 100,170 40,135"
              fill="#2346b1"
              stroke="#14161a"
              strokeWidth="1.5"
            />
            <polygon
              points="160,65 100,100 100,170 160,135"
              fill="#1a3690"
              stroke="#14161a"
              strokeWidth="1.5"
            />
          </g>
        </svg>
        <span className="font-mono text-[13px] text-[#eef2fe]">{t('contact.kicker')}</span>
        <h2
          id="contact-title"
          className="relative m-0 max-w-[860px] text-[clamp(38px,6vw,88px)] leading-[0.98] font-bold tracking-[-0.035em] text-balance"
        >
          {t('contact.titleBefore')} <span className="serif-accent">{t('contact.titleHighlight')}</span>
        </h2>
        <div className="relative flex flex-wrap gap-3">
          <a
            href={`mailto:${profile.email}`}
            aria-label={t('contact.emailLabel', { email: profile.email })}
            className={buttonClasses('inverse', 'md', `${big} max-w-full overflow-hidden`)}
          >
            <MailIcon />
            <span className="truncate">{profile.email}</span>
          </a>
          <ExternalLink href={profile.linkedinUrl} className={buttonClasses('outline-light', 'md', big)}>
            LinkedIn <span aria-hidden="true">↗</span>
          </ExternalLink>
          <ExternalLink href={profile.githubUrl} className={buttonClasses('outline-light', 'md', big)}>
            GitHub <span aria-hidden="true">↗</span>
          </ExternalLink>
          <ResumeDownloadButton
            resumeUrl={profile.resumeUrl}
            variant="primary"
            className="max-[480px]:w-full"
          />
        </div>
      </div>
    </section>
  );
}
