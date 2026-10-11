import { useTranslation } from 'react-i18next';
import type { Project } from '@/api/public-portfolio/schema';
import { TechTag } from '@/components/ui/badge';
import { ExternalLink } from '@/components/ui/external-link';
import { ArrowUpRightIcon } from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { CardHeaderVisual } from './card-header-visual';

export function ProjectCard({
  project,
  index,
  className,
  headingLevel = 'h3',
}: {
  project: Project;
  /** Posición en la lista completa (numeración 01, 02…). */
  index: number;
  className?: string;
  headingLevel?: 'h3' | 'h4';
}) {
  const { t } = useTranslation();
  const Heading = headingLevel;
  const isOpen = project.type === 'OPEN';

  return (
    <article
      className={cn(
        'card-lift flex flex-col overflow-hidden rounded-card border-[1.5px] border-ink bg-surface',
        className,
      )}
    >
      <CardHeaderVisual project={project} index={index} />
      <div className="flex flex-1 flex-col gap-3.5 px-6 pt-[22px] pb-6">
        <div className="flex flex-wrap justify-between gap-2 font-mono text-xs text-ink-muted">
          <span>
            {String(index + 1).padStart(2, '0')} · {project.organization}
            {project.clientContext && <span className="sr-only"> · {project.clientContext}</span>}
          </span>
          <span>{t(`projects.kind.${project.type}`)}</span>
        </div>
        <Heading className="m-0 text-[25px] leading-[1.1] font-bold tracking-[-0.02em]">
          {project.title}
        </Heading>
        <p className="m-0 text-[15.5px] leading-[1.55] text-pretty text-ink-soft">{project.description}</p>
        {project.metric && (
          <p className="m-0 flex items-baseline gap-2.5 rounded-[14px] bg-cobalt-soft px-3.5 py-3">
            <strong className="text-[22px] font-bold tracking-[-0.02em] text-cobalt-deep">
              {project.metric.value}
            </strong>
            <span className="text-sm text-[#2b3550]">{project.metric.label}</span>
          </p>
        )}
        <ul className="m-0 mt-auto flex list-none flex-wrap gap-1.5 p-0 pt-1.5">
          {project.technologies.map((tech) => (
            <li key={tech}>
              <TechTag>{tech}</TechTag>
            </li>
          ))}
        </ul>
        {/* RN-02: un proyecto privado nunca muestra enlace al código */}
        {isOpen && project.repositoryUrl && (
          <ExternalLink
            href={project.repositoryUrl}
            className="inline-flex min-h-11 items-center gap-2 self-start text-[15px] font-semibold underline underline-offset-4 hover:text-cobalt"
          >
            {t('projects.viewRepo')}
            <ArrowUpRightIcon size={16} />
            <span className="sr-only">: {project.title}</span>
          </ExternalLink>
        )}
      </div>
    </article>
  );
}
