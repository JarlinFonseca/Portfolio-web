import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router';
import {
  ChartIcon,
  CloseIcon,
  GridIcon,
  LayersIcon,
  ListIcon,
  MenuIcon,
  UserIcon,
} from '@/components/ui/icons';
import { cn } from '@/utils/cn';

const LINKS = [
  { to: '/admin/projects', key: 'projects', Icon: GridIcon },
  { to: '/admin/career', key: 'career', Icon: ListIcon },
  { to: '/admin/stack', key: 'stack', Icon: LayersIcon },
  { to: '/admin/highlights', key: 'highlights', Icon: ChartIcon },
  { to: '/admin/profile', key: 'profile', Icon: UserIcon },
] as const;

/** Menú lateral del panel; en pantallas < 1024 px se pliega bajo un botón de menú. */
export function AdminSidebar({ onLogout, loggingOut }: { onLogout: () => void; loggingOut: boolean }) {
  const { t } = useTranslation('admin');
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <aside className="flex shrink-0 flex-col gap-7 bg-night px-4 py-4 text-night-text lg:sticky lg:top-0 lg:h-screen lg:w-[272px] lg:py-6">
      <div className="flex items-center justify-between gap-3">
        <a href="/es" className="flex items-center gap-2.5 px-2 text-paper no-underline hover:text-paper">
          <span
            aria-hidden="true"
            className="flex size-[38px] items-center justify-center rounded-[11px] bg-paper text-[15px] font-extrabold text-ink"
          >
            JF
          </span>
          <span className="flex flex-col">
            <span className="text-base font-bold">{t('brand')}</span>
            <span className="font-mono text-[11px] text-[#8a8e97]">{t('brandSub')}</span>
          </span>
        </a>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="admin-nav"
          aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          onClick={() => setOpen((o) => !o)}
          className="flex size-11 items-center justify-center rounded-lg text-paper hover:bg-white/10 lg:hidden"
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      <div id="admin-nav" className={cn('flex-1 flex-col gap-7 lg:flex', open ? 'flex' : 'hidden')}>
        <nav aria-label={t('nav.label')}>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {LINKS.map(({ to, key, Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[15px] no-underline transition-colors',
                      isActive
                        ? 'bg-cobalt font-semibold text-white hover:text-white'
                        : 'text-night-text hover:text-white',
                    )
                  }
                >
                  <Icon />
                  {t(`nav.${key}`)}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-[#2a2d35] pt-4">
          <a
            href="/es"
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center px-3 text-sm text-night-text no-underline hover:text-white"
          >
            {t('nav.viewSite')} <span aria-hidden="true">&nbsp;↗</span>
          </a>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="flex min-h-11 cursor-pointer items-center px-3 text-left text-sm text-night-text hover:text-white disabled:opacity-60"
          >
            {t('nav.logout')}
          </button>
        </div>
      </div>
    </aside>
  );
}
