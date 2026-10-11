import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import type { AdminProfile, ResumeFile } from '@/api/admin/model';
import type { Lang } from '@/api/public-portfolio/schema';
import { AdminCard, AdminPageHeader } from '@/components/layout/admin-page';
import { Button } from '@/components/ui/button';
import { Field, Input, PrefixedInput, Textarea } from '@/components/ui/field';
import { CheckIcon, UploadIcon } from '@/components/ui/icons';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { useToast } from '@/components/ui/toast';
import { UnsavedChangesGuard } from '@/components/ui/unsaved-changes-guard';
import { ApiError } from '@/lib/http/api-error';
import { IMAGE_RULE, PDF_RULE, validateFile } from '@/lib/http/upload';
import {
  useAccount,
  useChangeLoginEmail,
  useChangePassword,
  usePhoto,
  useSaveProfile,
  useUploadResume,
} from '../api';

const USER = /^[A-Za-z0-9_.-]+$/;
const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'common.required'),
  role: z.string().trim().min(1, 'common.required'),
  location: z.string().trim(),
  intro: z.object({ es: z.string().trim().min(1, 'common.required'), en: z.string().trim() }),
  email: z.string().trim().min(1, 'common.required').email('common.invalidEmail'),
  linkedinUser: z.string().trim().min(1, 'common.required').regex(USER, 'profile.userInvalid'),
  githubUser: z.string().trim().min(1, 'common.required').regex(USER, 'profile.userInvalid'),
});
type ProfileValues = z.infer<typeof profileSchema>;

const PROFILE_FORM = 'profile-form';

export function ProfileAdmin({ profile }: { profile: AdminProfile }) {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const saveProfile = useSaveProfile();
  const msg = (key: unknown) => (typeof key === 'string' && key ? t(key as never) : undefined);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      role: profile.role,
      location: profile.location,
      intro: profile.intro,
      email: profile.email,
      linkedinUser: profile.linkedinUser,
      githubUser: profile.githubUser,
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    try {
      const saved = await saveProfile.mutateAsync(values);
      reset({
        fullName: saved.fullName,
        role: saved.role,
        location: saved.location,
        intro: saved.intro,
        email: saved.email,
        linkedinUser: saved.linkedinUser,
        githubUser: saved.githubUser,
      });
      toast.success(t('common.saved')); // RF-PER-10
    } catch (error) {
      if (error instanceof ApiError) {
        Object.entries(error.fieldErrors).forEach(([field, message]) =>
          setError(field as keyof ProfileValues, { message }),
        );
      }
      toast.error(t('common.saveError'));
    }
  };

  return (
    <>
      <UnsavedChangesGuard
        when={isDirty}
        title={t('common.unsavedTitle')}
        description={t('common.unsavedText')}
        leaveLabel={t('common.leave')}
        stayLabel={t('common.stay')}
      />
      <AdminPageHeader
        breadcrumb={`${t('breadcrumb.settings')} / ${t('nav.profile')}`}
        title={t('profile.title')}
        actions={
          <Button
            type="submit"
            form={PROFILE_FORM}
            variant="cobalt"
            size="lg"
            icon={<CheckIcon />}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.saving') : t('common.saveChanges')}
          </Button>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <form
          id={PROFILE_FORM}
          noValidate
          onSubmit={handleSubmit(onSubmit, () => toast.error(t('common.fixErrors')))}
          className="contents"
        >
          <div className="flex flex-col gap-6">
            <AdminCard title={t('profile.photoSection')} labelledBy="pf-photo">
              <PhotoControl photoUrl={profile.photoUrl} />
              <Field label={t('profile.fullName')} error={msg(errors.fullName?.message)}>
                <Input autoComplete="name" {...register('fullName')} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t('profile.role')} error={msg(errors.role?.message)}>
                  <Input {...register('role')} />
                </Field>
                <Field label={t('profile.location')}>
                  <Input {...register('location')} />
                </Field>
              </div>
              <Field label={t('profile.introEs')} tag={t('common.es')} error={msg(errors.intro?.es?.message)}>
                <Textarea rows={4} {...register('intro.es')} />
              </Field>
              <Field label={t('profile.introEs')} tag={t('common.en')}>
                <Textarea rows={4} {...register('intro.en')} />
              </Field>
            </AdminCard>
          </div>

          <div className="flex flex-col gap-6">
            <AdminCard title={t('profile.contactSection')} labelledBy="pf-contact">
              <Field label={t('profile.email')} error={msg(errors.email?.message)}>
                <PrefixedInput prefix="mailto:" type="email" inputMode="email" {...register('email')} />
              </Field>
              <Field label={t('profile.linkedin')} error={msg(errors.linkedinUser?.message)}>
                <PrefixedInput prefix="linkedin.com/in/" {...register('linkedinUser')} />
              </Field>
              <Field label={t('profile.github')} error={msg(errors.githubUser?.message)}>
                <PrefixedInput prefix="github.com/" {...register('githubUser')} />
              </Field>
            </AdminCard>

            <AdminCard title={t('profile.resumeSection')} labelledBy="pf-resume">
              <p className="m-0 -mt-2 text-[13px] text-ink-muted">{t('profile.resumeHint')}</p>
              <ResumeRow lang="es" label={t('profile.resumeEs')} file={profile.resume.es} />
              <ResumeRow lang="en" label={t('profile.resumeEn')} file={profile.resume.en} />
            </AdminCard>

            <AccountCard />
          </div>
        </form>
      </div>
    </>
  );
}

function PhotoControl({ photoUrl }: { photoUrl: string | null }) {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const { upload, remove } = usePhoto();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);

  const onFile = async (file: File) => {
    if (validateFile(file, IMAGE_RULE)) return toast.error(t('profile.photoInvalid'));
    try {
      setProgress(0);
      await upload.mutateAsync({ file, onProgress: setProgress });
      toast.success(t('profile.photoUpdated'));
    } catch (error) {
      toast.error(t('common.saveError'), error instanceof ApiError ? error.detail : undefined);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-5">
      <ProfileAvatar
        photoUrl={photoUrl}
        alt={photoUrl ? t('profile.photoAlt') : t('profile.photoPlaceholder')}
        size={112}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            icon={<UploadIcon size={16} />}
            onClick={() => inputRef.current?.click()}
            disabled={progress !== null}
          >
            {t('profile.upload')}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="text-danger hover:text-danger"
            disabled={!photoUrl || remove.isPending}
            onClick={() =>
              remove.mutate(undefined, {
                onSuccess: () => toast.success(t('profile.photoRemoved')),
                onError: () => toast.error(t('common.saveError')),
              })
            }
          >
            {t('profile.remove')}
          </Button>
        </div>
        <p className="m-0 text-[13px] leading-snug text-ink-muted">{t('profile.photoHint')}</p>
        {progress !== null && (
          <progress
            max={100}
            value={progress}
            aria-label={t('profile.upload')}
            className="h-2 w-full accent-cobalt"
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_RULE.types.join(',')}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}

function ResumeRow({ lang, label, file }: { lang: Lang; label: string; file: ResumeFile }) {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const upload = useUploadResume();
  const inputRef = useRef<HTMLInputElement>(null);
  const langName = lang === 'es' ? t('common.spanish') : t('common.english');

  const onFile = async (selected: File) => {
    if (validateFile(selected, PDF_RULE)) return toast.error(t('profile.pdfOnly'));
    try {
      await upload.mutateAsync({ lang, file: selected });
      toast.success(t('profile.resumeUploaded'));
    } catch (error) {
      toast.error(t('common.saveError'), error instanceof ApiError ? error.detail : undefined);
    }
  };

  return (
    <div className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-3.5">
      <span
        aria-hidden="true"
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#fbe9e2] font-mono text-[10px] text-danger"
      >
        PDF
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[16px] font-semibold">{label}</span>
        {file ? (
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-mono text-xs text-ink-muted hover:text-cobalt"
          >
            {file.fileName}
          </a>
        ) : (
          <span className="font-mono text-xs text-ink-muted">{t('profile.noFile')}</span>
        )}
      </div>
      <Button
        size="sm"
        variant="secondary"
        disabled={upload.isPending}
        aria-label={
          file ? t('profile.replaceLabel', { lang: langName }) : t('profile.uploadLabel', { lang: langName })
        }
        onClick={() => inputRef.current?.click()}
      >
        {upload.isPending ? t('common.saving') : file ? t('profile.replace') : t('profile.uploadPdf')}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (selected) void onFile(selected);
          e.target.value = '';
        }}
      />
    </div>
  );
}

/**
 * Cuenta de acceso: acciones independientes del perfil (no se envían con «Guardar cambios»);
 * Enter en sus campos ejecuta su propia acción y no el formulario del perfil.
 */
function AccountCard() {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const account = useAccount();
  const changeEmail = useChangeLoginEmail();
  const changePassword = useChangePassword();
  const [email, setEmail] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>();
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [pwErrors, setPwErrors] = useState<{ currentPassword?: string; newPassword?: string }>({});

  const emailValue = email ?? account.data?.loginEmail ?? '';

  const submitEmail = () => {
    if (!z.email().safeParse(emailValue.trim()).success) return setEmailError(t('common.invalidEmail'));
    setEmailError(undefined);
    changeEmail.mutate(emailValue.trim(), {
      onSuccess: () => {
        setEmail(null);
        toast.success(t('profile.emailUpdated'));
      },
      onError: (error) => {
        if (error instanceof ApiError && error.fieldErrors.email) setEmailError(error.fieldErrors.email);
        toast.error(t('common.saveError'));
      },
    });
  };

  const submitPassword = () => {
    const errs: typeof pwErrors = {};
    if (!passwords.currentPassword) errs.currentPassword = t('common.required');
    if (passwords.newPassword.length < 10) errs.newPassword = t('profile.passwordTooShort');
    setPwErrors(errs);
    if (Object.keys(errs).length) return;
    changePassword.mutate(passwords, {
      onSuccess: () => {
        setPasswords({ currentPassword: '', newPassword: '' });
        toast.success(t('profile.passwordUpdated'));
      },
      onError: (error) => {
        if (error instanceof ApiError) setPwErrors(error.fieldErrors);
        toast.error(t('common.saveError'), error instanceof ApiError ? error.detail : undefined);
      },
    });
  };

  return (
    <AdminCard title={t('profile.accountSection')} labelledBy="pf-account">
      <Field label={t('profile.loginEmail')} hint={t('profile.loginEmailHint')} error={emailError}>
        <Input
          type="email"
          autoComplete="username"
          value={emailValue}
          placeholder="tucorreo@ejemplo.com"
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submitEmail();
            }
          }}
        />
      </Field>
      <Button
        variant="secondary"
        className="self-start"
        disabled={changeEmail.isPending || !email || email === account.data?.loginEmail}
        onClick={submitEmail}
      >
        {t('profile.updateEmail')}
      </Button>
      <div className="border-t border-line" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t('profile.currentPassword')} error={pwErrors.currentPassword}>
          <Input
            type="password"
            autoComplete="current-password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitPassword();
              }
            }}
          />
        </Field>
        <Field
          label={t('profile.newPassword')}
          hint={t('profile.newPasswordHint')}
          error={pwErrors.newPassword}
        >
          <Input
            type="password"
            autoComplete="new-password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                submitPassword();
              }
            }}
          />
        </Field>
      </div>
      <Button
        variant="secondary"
        className="self-start"
        disabled={changePassword.isPending}
        onClick={submitPassword}
      >
        {t('profile.updatePassword')}
      </Button>
    </AdminCard>
  );
}
