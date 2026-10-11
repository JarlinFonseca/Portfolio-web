import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { useSession } from '@/features/auth/api';
import { LoginForm } from '@/features/auth/components/login-form';
import { ArrowLeftIcon } from '@/components/ui/icons';
import { MOCK_CREDENTIALS } from '@/testing/msw/credentials';
import './admin-i18n';

export function meta() {
  return [{ title: 'Iniciar sesión — Admin · Portfolio' }, { name: 'robots', content: 'noindex, nofollow' }];
}

export default function Login() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const session = useSession();
  const redirectTo = safeRedirect(params.get('redirect'));
  const reason = params.get('reason');
  const notice =
    reason === 'expired' ? t('login.sessionExpired') : reason === 'logout' ? t('login.loggedOut') : undefined;

  // Con sesión válida no tiene sentido mostrar el login
  useEffect(() => {
    if (session.data) void navigate(redirectTo, { replace: true });
  }, [session.data, navigate, redirectTo]);

  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[minmax(0,548px)_1fr]">
      <section className="relative flex flex-col justify-between gap-10 overflow-hidden bg-night px-6 py-8 text-paper sm:px-16 sm:py-16">
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-xl bg-paper font-extrabold text-ink"
            aria-hidden="true"
          >
            JF
          </span>
          <span className="text-[17px] font-bold">Jarlin Fonseca</span>
        </div>
        <div className="relative flex flex-col gap-4">
          <span className="font-mono text-[13px] text-cobalt-light">{t('login.kicker')}</span>
          <p className="m-0 text-[clamp(40px,4.5vw,60px)] leading-[1.02] font-bold tracking-[-0.035em]">
            {t('login.titleBefore')}
            <br />
            <span className="serif-accent text-cobalt-light">{t('login.titleHighlight')}</span>
          </p>
          <p className="m-0 max-w-[420px] text-[17px] leading-relaxed text-night-text">{t('login.lead')}</p>
          <svg
            viewBox="0 0 170 190"
            width="170"
            height="190"
            aria-hidden="true"
            className="absolute -top-16 right-0 hidden motion-safe:animate-float sm:block"
          >
            <polygon points="85,5 165,50 85,95 5,50" fill="#5278e8" stroke="#dce4fc" strokeWidth="1.5" />
            <polygon points="5,50 85,95 85,185 5,140" fill="#2346b1" stroke="#dce4fc" strokeWidth="1.5" />
            <polygon points="165,50 85,95 85,185 165,140" fill="#1a3690" stroke="#dce4fc" strokeWidth="1.5" />
          </svg>
        </div>
        <p className="m-0 font-mono text-xs text-[#8a8e97]">{t('login.footer')}</p>
      </section>

      <main className="flex flex-col items-center justify-center gap-8 px-6 py-12">
        <LoginForm notice={notice} onSuccess={() => void navigate(redirectTo, { replace: true })} />
        {import.meta.env.VITE_ENABLE_MSW === 'true' && (
          <p className="m-0 max-w-[420px] rounded-xl border border-dashed border-line-strong px-4 py-3 font-mono text-xs text-ink-muted">
            {t('login.devHint', MOCK_CREDENTIALS)}
          </p>
        )}
        <a
          href="/es"
          className="inline-flex min-h-11 items-center gap-2 text-[15px] underline underline-offset-4 hover:text-cobalt"
        >
          <ArrowLeftIcon size={16} />
          {t('login.backToSite')}
        </a>
      </main>
    </div>
  );
}

/** Solo redirige dentro del admin (evita redirecciones abiertas). */
function safeRedirect(value: string | null): string {
  return value && value.startsWith('/admin/') && !value.startsWith('//') ? value : '/admin/projects';
}
