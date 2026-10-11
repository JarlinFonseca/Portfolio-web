import { useTranslation } from 'react-i18next';

export function SiteFooter({ fullName }: { fullName: string }) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  return (
    <footer className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-3 px-4 pb-10 text-sm text-ink-muted sm:px-6">
      <span>{t('footer.copyright', { year, name: fullName })}</span>
      <span className="font-mono text-xs">{t('footer.credit')}</span>
    </footer>
  );
}
