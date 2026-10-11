import { zodResolver } from '@hookform/resolvers/zod';
import { type ReactNode, useEffect } from 'react';
import {
  type DefaultValues,
  type FieldValues,
  type Resolver,
  useForm,
  type UseFormReturn,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { languageLevelSchema } from '@/api/public-portfolio/schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, Textarea } from '@/components/ui/field';
import {
  certificationFormSchema,
  educationFormSchema,
  experienceFormSchema,
  languageFormSchema,
  type CertificationForm,
  type EducationForm,
  type ExperienceForm,
  type LanguageForm,
} from '../../schemas';

interface FormProps<T> {
  title: string;
  kindLabel: string;
  defaultValues: T;
  saving: boolean;
  onSubmit: (values: T) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
}

/** Marco común: título, campos y botones Descartar / Guardar. */
function EditorShell<T extends FieldValues>({
  form,
  title,
  kindLabel,
  saving,
  onSubmit,
  children,
}: {
  form: UseFormReturn<T>;
  title: string;
  kindLabel: string;
  saving: boolean;
  onSubmit: (values: T) => Promise<void>;
  children: ReactNode;
}) {
  const { t } = useTranslation('admin');
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      className="flex flex-col gap-5 rounded-card border-[1.5px] border-ink bg-surface p-5 sm:p-6"
      aria-labelledby="career-editor-title"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 id="career-editor-title" className="m-0 text-[22px] font-bold tracking-[-0.01em]">
          {title}
        </h2>
        <span className="pt-1.5 font-mono text-xs text-ink-muted">{kindLabel}</span>
      </div>
      {children}
      <div className="flex flex-wrap justify-end gap-2.5 border-t border-line pt-5">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => form.reset()}
          disabled={!form.formState.isDirty || saving}
        >
          {t('common.discard')}
        </Button>
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  );
}

function useCareerForm<T extends FieldValues>(
  schema: Parameters<typeof zodResolver>[0],
  defaultValues: T,
  onDirtyChange: (dirty: boolean) => void,
) {
  const form = useForm<T>({
    resolver: zodResolver(schema) as unknown as Resolver<T>,
    defaultValues: defaultValues as DefaultValues<T>,
  });
  const dirty = form.formState.isDirty;
  // avisa al contenedor para proteger el cambio de registro o pestaña
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);
  return form;
}

function useMsg() {
  const { t } = useTranslation('admin');
  return (key: unknown) => (typeof key === 'string' && key ? t(key as never) : undefined);
}

export function ExperienceEditor(props: FormProps<ExperienceForm>) {
  const { t } = useTranslation('admin');
  const msg = useMsg();
  const form = useCareerForm<ExperienceForm>(experienceFormSchema, props.defaultValues, props.onDirtyChange);
  const { register, watch, formState } = form;
  const e = formState.errors;
  const current = watch('current');
  return (
    <EditorShell
      form={form}
      title={props.title}
      kindLabel={props.kindLabel}
      saving={props.saving}
      onSubmit={props.onSubmit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t('career.company')} error={msg(e.company?.message)}>
          <Input {...register('company')} />
        </Field>
        <Field label={t('career.city')}>
          <Input {...register('city')} />
        </Field>
        <Field label={t('career.roleEs')} error={msg(e.role?.es?.message)}>
          <Input {...register('role.es')} />
        </Field>
        <Field label={t('career.roleEn')}>
          <Input {...register('role.en')} />
        </Field>
        <Field label={t('career.start')} hint={t('career.monthHint')} error={msg(e.startMonth?.message)}>
          <Input type="month" placeholder="2024-02" {...register('startMonth')} />
        </Field>
        <Field label={t('career.end')} error={msg(e.endMonth?.message)}>
          <Input type="month" placeholder="2024-12" disabled={current} {...register('endMonth')} />
        </Field>
      </div>
      <Checkbox label={t('career.current')} {...register('current')} />
      <Field label={t('career.summaryEs')} error={msg(e.summary?.es?.message)}>
        <Textarea rows={3} {...register('summary.es')} />
      </Field>
      <Field label={t('career.summaryEn')}>
        <Textarea rows={3} {...register('summary.en')} />
      </Field>
    </EditorShell>
  );
}

export function EducationEditor(props: FormProps<EducationForm>) {
  const { t } = useTranslation('admin');
  const msg = useMsg();
  const form = useCareerForm<EducationForm>(educationFormSchema, props.defaultValues, props.onDirtyChange);
  const { register, formState } = form;
  const e = formState.errors;
  return (
    <EditorShell
      form={form}
      title={props.title}
      kindLabel={props.kindLabel}
      saving={props.saving}
      onSubmit={props.onSubmit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t('career.institution')} error={msg(e.institution?.message)}>
          <Input {...register('institution')} />
        </Field>
        <Field label={t('career.city')}>
          <Input {...register('city')} />
        </Field>
        <Field label={t('career.programEs')} error={msg(e.program?.es?.message)}>
          <Input {...register('program.es')} />
        </Field>
        <Field label={t('career.programEn')}>
          <Input {...register('program.en')} />
        </Field>
        <Field label={t('career.start')} optional={t('common.optional')} error={msg(e.startMonth?.message)}>
          <Input type="month" {...register('startMonth')} />
        </Field>
        <Field label={t('career.end')} optional={t('common.optional')} error={msg(e.endMonth?.message)}>
          <Input type="month" {...register('endMonth')} />
        </Field>
      </div>
      <Checkbox label={t('career.showOnSite')} {...register('visible')} />
    </EditorShell>
  );
}

export function CertificationEditor(props: FormProps<CertificationForm>) {
  const { t } = useTranslation('admin');
  const msg = useMsg();
  const form = useCareerForm<CertificationForm>(
    certificationFormSchema,
    props.defaultValues,
    props.onDirtyChange,
  );
  const { register, formState } = form;
  const e = formState.errors;
  return (
    <EditorShell
      form={form}
      title={props.title}
      kindLabel={props.kindLabel}
      saving={props.saving}
      onSubmit={props.onSubmit}
    >
      <Field label={t('career.name')} error={msg(e.name?.message)}>
        <Input {...register('name')} />
      </Field>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t('career.issuer')} error={msg(e.issuer?.message)}>
          <Input {...register('issuer')} />
        </Field>
        <Field label={t('career.kind')}>
          <select className="field min-h-12" {...register('kind')}>
            <option value="CERTIFICATION">{t('career.kindCERTIFICATION')}</option>
            <option value="COURSE">{t('career.kindCOURSE')}</option>
          </select>
        </Field>
        <Field label={t('career.issued')} optional={t('common.optional')} error={msg(e.issuedMonth?.message)}>
          <Input type="month" {...register('issuedMonth')} />
        </Field>
        <Field
          label={t('career.credentialUrl')}
          optional={t('common.optional')}
          error={msg(e.credentialUrl?.message)}
        >
          <Input type="url" inputMode="url" placeholder="https://" {...register('credentialUrl')} />
        </Field>
      </div>
      <Checkbox label={t('career.showOnSite')} {...register('visible')} />
    </EditorShell>
  );
}

export function LanguageEditor(props: FormProps<LanguageForm>) {
  const { t } = useTranslation('admin');
  const msg = useMsg();
  const form = useCareerForm<LanguageForm>(languageFormSchema, props.defaultValues, props.onDirtyChange);
  const { register, formState } = form;
  const e = formState.errors;
  return (
    <EditorShell
      form={form}
      title={props.title}
      kindLabel={props.kindLabel}
      saving={props.saving}
      onSubmit={props.onSubmit}
    >
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t('career.nameEs')} error={msg(e.name?.es?.message)}>
          <Input {...register('name.es')} />
        </Field>
        <Field label={t('career.nameEn')}>
          <Input {...register('name.en')} />
        </Field>
        <Field label={t('career.level')}>
          <select className="field min-h-12" {...register('level')}>
            {languageLevelSchema.options.map((level) => (
              <option key={level} value={level}>
                {t(`career.levels.${level}`)}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </EditorShell>
  );
}
