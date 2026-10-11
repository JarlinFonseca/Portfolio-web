import { zodResolver } from '@hookform/resolvers/zod';
import { forwardRef, type InputHTMLAttributes, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input } from '@/components/ui/field';
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from '@/components/ui/icons';
import { ApiError } from '@/lib/http/api-error';
import { useLogin } from '../api';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'required').email('invalidEmail'),
  password: z.string().min(1, 'required'),
  remember: z.boolean(),
});
type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ onSuccess, notice }: { onSuccess: () => void; notice?: string | undefined }) {
  const { t } = useTranslation('admin');
  const [showPassword, setShowPassword] = useState(false);
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false },
  });

  const fieldError = (key?: string) => (key ? t(`common.${key as 'required' | 'invalidEmail'}`) : undefined);

  const serverError = login.error
    ? login.error instanceof ApiError && login.error.status === 401
      ? t('login.invalid')
      : t('login.genericError')
    : null;

  return (
    <form
      noValidate
      onSubmit={handleSubmit((values) => login.mutate(values, { onSuccess }))}
      className="flex w-full max-w-[420px] flex-col gap-6"
      aria-labelledby="login-title"
    >
      <div className="flex flex-col gap-2">
        <h1 id="login-title" className="m-0 text-[clamp(30px,3vw,36px)] font-bold tracking-[-0.03em]">
          {t('login.title')}
        </h1>
        <p className="m-0 text-base text-ink-muted">{t('login.subtitle')}</p>
      </div>

      {notice && !serverError && (
        <p role="status" className="m-0 rounded-xl bg-cobalt-soft px-4 py-3 text-sm text-[#2b3550]">
          {notice}
        </p>
      )}
      {serverError && (
        <p
          role="alert"
          className="m-0 rounded-xl border border-danger/40 bg-[#fbe9e2] px-4 py-3 text-sm font-medium text-danger"
        >
          {serverError}
        </p>
      )}

      <Field label={t('login.email')} error={fieldError(errors.email?.message)}>
        <Input
          type="email"
          autoComplete="username"
          inputMode="email"
          placeholder={t('login.emailPlaceholder')}
          {...register('email')}
        />
      </Field>

      <Field label={t('login.password')} error={fieldError(errors.password?.message)}>
        <PasswordInput
          show={showPassword}
          onToggle={() => setShowPassword((s) => !s)}
          toggleLabel={showPassword ? t('login.hidePassword') : t('login.showPassword')}
          {...register('password')}
        />
      </Field>
      {/* «¿Olvidaste tu contraseña?» se habilita en R4 (HU-08) */}

      <Checkbox label={t('login.remember')} {...register('remember')} />

      <Button
        type="submit"
        size="lg"
        disabled={login.isPending}
        iconRight={<ArrowRightIcon />}
        className="w-full"
      >
        {login.isPending ? t('login.submitting') : t('login.submit')}
      </Button>
    </form>
  );
}

const PasswordInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { show: boolean; onToggle: () => void; toggleLabel: string }
>(function PasswordInput({ show, onToggle, toggleLabel, ...props }, ref) {
  return (
    <div className="relative">
      <Input
        ref={ref}
        type={show ? 'text' : 'password'}
        autoComplete="current-password"
        className="pr-14"
        {...props}
      />
      <button
        type="button"
        onClick={onToggle}
        aria-label={toggleLabel}
        aria-pressed={show}
        className="absolute top-1/2 right-1.5 flex size-11 -translate-y-1/2 items-center justify-center rounded-lg text-ink-muted hover:text-ink"
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
});
