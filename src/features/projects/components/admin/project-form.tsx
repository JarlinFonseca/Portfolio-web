import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Controller, type FieldErrors, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import type { AdminProject } from '@/api/admin/model';
import type { Lang } from '@/api/public-portfolio/schema';
import { AdminCard, AdminPageHeader } from '@/components/layout/admin-page';
import { Button, RouterLinkButton } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, Input, Textarea } from '@/components/ui/field';
import { ArrowLeftIcon, CheckIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SwitchRow } from '@/components/ui/switch';
import { TagInput } from '@/components/ui/tag-input';
import { useToast } from '@/components/ui/toast';
import { UnsavedChangesGuard } from '@/components/ui/unsaved-changes-guard';
import { ApiError } from '@/lib/http/api-error';
import { cn } from '@/utils/cn';
import {
  projectImagesApi,
  projectsKey,
  uploadQueue,
  useReorderProjects,
  useSaveProject,
} from '../../api/admin-projects';
import {
  projectFormSchema,
  toFormValues,
  toPreviewProject,
  toProjectInput,
  type ProjectFormValues,
} from '../../schemas/project-form-schema';
import { ProjectCard } from '../public/project-card';
import { ImageManager, type PendingImage } from './image-manager';

const SPANISH_FIELDS = ['title', 'description'] as const;

export function ProjectForm({
  project,
  allProjects,
}: {
  project?: AdminProject;
  allProjects: AdminProject[];
}) {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const save = useSaveProject();
  const reorder = useReorderProjects();
  const [lang, setLang] = useState<Lang>('es');
  const [pending, setPending] = useState<PendingImage[]>([]);
  const [pendingCoverKey, setPendingCoverKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isNew = !project;
  const currentOrder = project
    ? allProjects.findIndex((p) => p.id === project.id) + 1
    : allProjects.length + 1;
  const maxOrder = isNew ? allProjects.length + 1 : allProjects.length;

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: toFormValues(project, currentOrder),
  });

  // Al recargar el proyecto (imágenes, versión) se conserva lo que el usuario está editando
  useEffect(() => {
    if (!isDirty) reset(toFormValues(project, currentOrder));
  }, [project, currentOrder, isDirty, reset]);

  const values = useWatch({ control });
  const type = values.type ?? 'PRIVATE';
  // los mensajes de validación son claves de i18n del espacio admin
  const msg = (key: unknown) => (typeof key === 'string' && key ? t(key as never) : undefined);

  const onInvalid = (errs: FieldErrors<ProjectFormValues>) => {
    if (SPANISH_FIELDS.some((f) => errs[f]?.es) && lang !== 'es') setLang('es');
    toast.error(t('common.fixErrors'));
  };

  const onSubmit = async (formValues: ProjectFormValues) => {
    try {
      const savedProject = await save.mutateAsync({
        id: project?.id,
        input: toProjectInput(formValues, project?.version),
      });

      if (isNew && pending.length) {
        const ordered = pendingCoverKey
          ? [
              ...pending.filter((p) => p.key === pendingCoverKey),
              ...pending.filter((p) => p.key !== pendingCoverKey),
            ]
          : pending;
        await uploadQueue(ordered, async (img) => {
          try {
            await projectImagesApi.upload(savedProject.id, img.file, img.alt);
          } catch {
            toast.error(t('images.uploadError', { name: img.file.name }));
          }
        });
      }

      // Orden en el sitio: se aplica con PATCH .../order si cambió
      const list = queryClient.getQueryData<AdminProject[]>(projectsKey) ?? allProjects;
      const without = list.filter((p) => p.id !== savedProject.id);
      const target = Math.min(Math.max(formValues.order, 1), without.length + 1) - 1;
      const currentIndex = list.findIndex((p) => p.id === savedProject.id);
      if (currentIndex !== target && (isNew ? target < without.length : true)) {
        const next = [...without];
        next.splice(target, 0, savedProject);
        await reorder.mutateAsync(next);
      }

      // el guard de cambios sin guardar debe verse desactivado antes de navegar
      flushSync(() => {
        setSaved(true);
        reset(formValues);
      });
      toast.success(isNew ? t('projectForm.created') : t('common.saved'));
      await navigate('/admin/projects');
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(t('common.conflict'));
        return;
      }
      if (error instanceof ApiError) {
        Object.entries(error.fieldErrors).forEach(([field, message]) =>
          setError(field as keyof ProjectFormValues, { message }),
        );
      }
      toast.error(t('common.saveError'), error instanceof ApiError ? error.detail : undefined);
    }
  };

  const cover = project
    ? (project.images.find((i) => i.id === project.coverImageId) ?? project.images[0] ?? null)
    : (pending.find((p) => p.key === pendingCoverKey) ?? pending[0] ?? null);
  const previewCover = cover ? { url: 'url' in cover ? cover.url : cover.previewUrl, alt: cover.alt } : null;
  const preview = toPreviewProject(
    projectFormSchema.safeParse(values).data ?? toFormValues(undefined, currentOrder),
    lang,
    previewCover,
    t('projectForm.newTitle'),
  );
  const spanishTabError = lang === 'en' && SPANISH_FIELDS.some((f) => errors[f]?.es);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-7">
      <UnsavedChangesGuard
        when={(isDirty || pending.length > 0) && !saved}
        title={t('common.unsavedTitle')}
        description={t('common.unsavedText')}
        leaveLabel={t('common.leave')}
        stayLabel={t('common.stay')}
      />
      <AdminPageHeader
        breadcrumb={
          <Link
            to="/admin/projects"
            className="inline-flex items-center gap-1 no-underline hover:text-cobalt"
          >
            <ArrowLeftIcon size={13} /> {t('projectForm.back')}
          </Link>
        }
        title={isNew ? t('projectForm.newTitle') : t('projectForm.editTitle')}
        actions={
          <>
            <RouterLinkButton to="/admin/projects" variant="secondary" size="lg">
              {t('common.cancel')}
            </RouterLinkButton>
            <Button type="submit" variant="cobalt" size="lg" icon={<CheckIcon />} disabled={isSubmitting}>
              {isSubmitting ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </>
        }
      />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <AdminCard
            title={t('projectForm.content')}
            labelledBy="pf-content"
            aside={
              <SegmentedControl
                appearance="tabs"
                label={t('projectForm.langTabs')}
                value={lang}
                onChange={setLang}
                options={[
                  { value: 'es', label: t('common.spanish') },
                  { value: 'en', label: t('common.english') },
                ]}
              />
            }
          >
            {spanishTabError && (
              <p
                role="alert"
                className="m-0 rounded-xl bg-[#fbe9e2] px-4 py-3 text-sm font-medium text-danger"
              >
                {t('projectForm.errorSpanishTab')}
              </p>
            )}
            {lang === 'en' && <p className="m-0 text-[13px] text-ink-muted">{t('projectForm.enHint')}</p>}
            <Field
              label={t('projectForm.titleField')}
              tag={lang.toUpperCase()}
              error={msg(errors.title?.[lang]?.message)}
            >
              <Input key={`title-${lang}`} {...register(`title.${lang}`)} />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label={t('projectForm.organization')} error={msg(errors.organization?.message)}>
                <Input {...register('organization')} />
              </Field>
              <Field
                label={t('projectForm.clientContext')}
                tag={lang.toUpperCase()}
                optional={t('common.optional')}
              >
                <Input key={`ctx-${lang}`} {...register(`clientContext.${lang}`)} />
              </Field>
            </div>
            <Field
              label={t('projectForm.description')}
              tag={lang.toUpperCase()}
              hint={t('projectForm.descriptionHint')}
              error={msg(errors.description?.[lang]?.message)}
            >
              <Textarea key={`desc-${lang}`} rows={5} {...register(`description.${lang}`)} />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label={t('projectForm.metricValue')}
                hint={t('projectForm.metricValueHint')}
                optional={t('common.optional')}
              >
                <Input placeholder="700+" {...register('metricValue')} />
              </Field>
              <Field
                label={t('projectForm.metricLabel')}
                tag={lang.toUpperCase()}
                optional={t('common.optional')}
              >
                <Input key={`ml-${lang}`} {...register(`metricLabel.${lang}`)} />
              </Field>
            </div>
          </AdminCard>

          <AdminCard title={t('projectForm.typeTitle')} labelledBy="pf-type">
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <div role="radiogroup" aria-labelledby="pf-type" className="grid gap-3 md:grid-cols-2">
                  {(['PRIVATE', 'OPEN'] as const).map((option) => {
                    const checked = field.value === option;
                    return (
                      <label
                        key={option}
                        className={cn(
                          'flex cursor-pointer flex-col gap-1 rounded-2xl border-[1.5px] p-4 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-cobalt',
                          checked
                            ? 'border-cobalt bg-cobalt-soft'
                            : 'border-line-strong bg-white hover:border-ink',
                        )}
                      >
                        <input
                          type="radio"
                          name={field.name}
                          value={option}
                          checked={checked}
                          onChange={() => {
                            field.onChange(option);
                            if (option === 'PRIVATE') {
                              setValue('repositoryUrl', '', { shouldDirty: true }); // RF-PRO-11
                              setValue('blurImages', true, { shouldDirty: true });
                            }
                          }}
                          className="sr-only"
                        />
                        <span className="text-[17px] font-bold">
                          {option === 'PRIVATE' ? t('projectForm.privateTitle') : t('projectForm.openTitle')}
                        </span>
                        <span className="text-sm leading-snug text-ink-soft">
                          {option === 'PRIVATE' ? t('projectForm.privateText') : t('projectForm.openText')}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            />
            <Field
              label={t('projectForm.repo')}
              hint={type === 'PRIVATE' ? t('projectForm.repoPrivateHint') : undefined}
              error={msg(errors.repositoryUrl?.message)}
            >
              <Input
                type="url"
                inputMode="url"
                disabled={type === 'PRIVATE'}
                placeholder={
                  type === 'PRIVATE' ? t('projectForm.repoDisabled') : t('projectForm.repoPlaceholder')
                }
                {...register('repositoryUrl')}
              />
            </Field>
            <Controller
              control={control}
              name="technologies"
              render={({ field }) => (
                <Field label={t('projectForm.technologies')} error={msg(errors.technologies?.message)}>
                  <TagInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={t('projectForm.techPlaceholder')}
                    removeLabel={(tag) => t('common.removeItem', { name: tag })}
                    onDuplicate={(tag) => toast.error(t('stack.duplicate', { name: tag }))}
                  />
                </Field>
              )}
            />
          </AdminCard>

          <AdminCard title={t('projectForm.images')} labelledBy="pf-images">
            <ImageManager
              projectId={project?.id}
              images={project?.images ?? []}
              coverImageId={project?.coverImageId ?? null}
              pending={pending}
              onPendingChange={setPending}
              pendingCoverKey={pendingCoverKey}
              onPendingCoverChange={setPendingCoverKey}
              blurred={values.blurImages ?? false}
              onChanged={() => void queryClient.invalidateQueries({ queryKey: projectsKey })}
            />
            <div className="rounded-2xl border border-line-strong bg-white p-4">
              <Checkbox
                label={t('projectForm.blur')}
                description={t('projectForm.blurHint')}
                {...register('blurImages')}
              />
            </div>
          </AdminCard>
        </div>

        <aside className="flex flex-col gap-5 xl:sticky xl:top-6">
          <AdminCard title={t('projectForm.publication')} labelledBy="pf-pub" className="gap-1">
            <Controller
              control={control}
              name="visible"
              render={({ field }) => (
                <SwitchRow
                  id="pf-visible"
                  title={t('projectForm.visible')}
                  description={t('projectForm.visibleHint')}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="border-t border-line" />
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <SwitchRow
                  id="pf-featured"
                  title={t('projectForm.featured')}
                  description={t('projectForm.featuredHint')}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <div className="border-t border-line" />
            <div className="flex items-center justify-between gap-4 pt-3">
              <label htmlFor="pf-order" className="text-[15px] font-semibold">
                {t('projectForm.order')}
              </label>
              <input
                id="pf-order"
                type="number"
                min={1}
                max={maxOrder}
                className="field min-h-12 w-[84px]"
                {...register('order', { valueAsNumber: true })}
              />
            </div>
          </AdminCard>

          <div className="flex flex-col gap-2.5">
            <h2 className="m-0 font-mono text-xs font-normal text-ink-muted">{t('projectForm.preview')}</h2>
            <div aria-hidden="true" className="pointer-events-none">
              <ProjectCard project={preview} index={Math.max(currentOrder - 1, 0)} headingLevel="h4" />
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
