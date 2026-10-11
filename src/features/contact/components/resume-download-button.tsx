import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { buttonClasses, type ButtonVariant } from '@/components/ui/button';
import { DownloadIcon } from '@/components/ui/icons';
import { cn } from '@/utils/cn';

/**
 * «Descargar HV»: entrega el PDF del idioma activo (la fuente ya aplica el respaldo en español).
 * Si no hay ningún PDF, queda deshabilitado con un texto explicativo.
 */
export function ResumeDownloadButton({
  resumeUrl,
  variant = 'cobalt',
  compact = false,
  className,
}: {
  resumeUrl: string | null;
  variant?: ButtonVariant;
  /** En el header: en pantallas < 560 px solo se ve el ícono. */
  compact?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const hintId = useId();
  const label = t('resume.download');
  const classes = buttonClasses(
    variant,
    compact ? 'sm' : 'md',
    cn(
      compact ? 'h-[42px] min-h-0 px-3.5 max-[560px]:px-0 max-[560px]:w-11' : 'min-h-14 px-6 text-base',
      className,
    ),
  );
  const content = (
    <>
      <DownloadIcon size={compact ? 16 : 18} />
      <span className={compact ? 'max-[560px]:sr-only' : undefined}>{label}</span>
    </>
  );

  if (!resumeUrl) {
    return (
      <span className="inline-flex flex-col gap-1">
        <span role="link" aria-disabled="true" aria-describedby={hintId} className={classes}>
          {content}
        </span>
        <span id={hintId} className={cn('text-xs', compact ? 'sr-only' : 'opacity-80')}>
          {t('resume.unavailable')}
        </span>
      </span>
    );
  }

  return (
    <a href={resumeUrl} download className={classes} type="application/pdf">
      {content}
    </a>
  );
}
