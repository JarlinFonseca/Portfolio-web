import { useTranslation } from 'react-i18next';
import type { Stack } from '@/api/public-portfolio/schema';
import { SectionHeading } from '@/components/layout/section-heading';
import { SECTION_IDS } from '@/components/layout/site-header';
import { TechTag } from '@/components/ui/badge';
import { TechCube } from './tech-cube';

function StackCategoryCard({ name, technologies }: { name: string; technologies: string[] }) {
  return (
    <li className="flex flex-col gap-3.5 rounded-[20px] border-[1.5px] border-ink bg-surface p-[22px]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="m-0 text-lg font-bold tracking-[-0.01em]">{name}</h3>
        <span className="font-mono text-xs text-ink-muted">
          {String(technologies.length).padStart(2, '0')}
        </span>
      </div>
      <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
        {technologies.map((tech) => (
          <li key={tech}>
            <TechTag tone="soft">{tech}</TechTag>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function StackSection({ stack }: { stack: Stack }) {
  const { t } = useTranslation();
  const cubeList = stack.cube
    .map((c) => c.technology)
    .filter(Boolean)
    .join(', ');
  return (
    <section
      id={SECTION_IDS.stack}
      aria-labelledby="stack-title"
      className="mx-auto grid max-w-[1280px] grid-cols-[repeat(auto-fit,minmax(min(380px,100%),1fr))] items-start gap-14 px-4 pt-24 pb-24 sm:px-6 sm:pt-[104px]"
    >
      <div className="flex flex-col gap-10">
        <SectionHeading
          id="stack-title"
          kicker={t('stack.kicker')}
          before={t('stack.titleBefore')}
          highlight={t('stack.titleHighlight')}
          lead={t('stack.lead')}
        />
        <p className="sr-only">{t('stack.cubeLabel', { list: cubeList })}</p>
        <TechCube cube={stack.cube} />
      </div>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-4 p-0">
        {stack.categories.map((c) => (
          <StackCategoryCard key={c.id} name={c.name} technologies={c.technologies} />
        ))}
      </ul>
    </section>
  );
}
