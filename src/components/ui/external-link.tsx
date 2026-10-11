import type { AnchorHTMLAttributes } from 'react';
import { useTranslation } from 'react-i18next';
import { VisuallyHidden } from './visually-hidden';

/** Enlace que abre en pestaña nueva y lo anuncia a lectores de pantalla. */
export function ExternalLink({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { t } = useTranslation();
  return (
    <a target="_blank" rel="noopener noreferrer" {...props}>
      {children}
      <VisuallyHidden> {t('a11y.newTab')}</VisuallyHidden>
    </a>
  );
}
