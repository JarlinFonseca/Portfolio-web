import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminStack } from '@/api/admin/model';
import { AdminPageHeader } from '@/components/layout/admin-page';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CheckIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import { DragHandle, SortableList } from '@/components/ui/sortable';
import { TagInput } from '@/components/ui/tag-input';
import { useToast } from '@/components/ui/toast';
import { UnsavedChangesGuard } from '@/components/ui/unsaved-changes-guard';
import { ApiError } from '@/lib/http/api-error';
import { cn } from '@/utils/cn';
import { useSaveStack } from '../../api';
import { releaseCubeFaces, validateStack, type StackIssue } from '../../utils/stack-rules';

/** Colores de cada cara, iguales al cubo del sitio. */
const FACE_STYLES = [
  'bg-cobalt text-white border-cobalt',
  'bg-surface text-ink border-line-strong',
  'bg-signal text-ink border-signal',
  'bg-[#2a2d35] text-white border-[#3a3e48]',
  'bg-cobalt-soft text-ink border-cobalt-soft',
  'bg-surface text-ink border-line-strong',
];

let tempId = 0;

export function StackAdmin({ initial }: { initial: AdminStack }) {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const save = useSaveStack();
  const [draft, setDraft] = useState<AdminStack>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [issues, setIssues] = useState<StackIssue[]>([]);
  const [toDelete, setToDelete] = useState<AdminStack['categories'][number] | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);

  const dirty = JSON.stringify(draft) !== baseline;

  useEffect(() => {
    if (!focusId) return;
    document.getElementById(`cat-name-${focusId}`)?.focus();
    setFocusId(null);
  }, [focusId]);

  /** Aplica un cambio en categorías y libera las caras del cubo que queden huérfanas. */
  const updateCategories = (categories: AdminStack['categories']) => {
    const { stack, freed } = releaseCubeFaces({ ...draft, categories });
    freed.forEach(({ face, tech }) => toast.error(t('stack.cubeFaceRemoved', { name: tech, n: face + 1 })));
    setDraft(stack);
    if (freed.length)
      setIssues((prev) => [...prev, ...freed.map((f) => ({ kind: 'cubeEmpty' as const, face: f.face }))]);
  };

  const patchCategory = (id: string, patch: Partial<AdminStack['categories'][number]>) =>
    updateCategories(draft.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const addCategory = () => {
    const id = `cat-new-${Date.now().toString(36)}${tempId++}`;
    setDraft((d) => ({
      ...d,
      categories: [
        ...d.categories,
        { id, name: { es: t('stack.newCategoryName'), en: '' }, technologies: [] },
      ],
    }));
    setFocusId(id);
  };

  const onSave = async () => {
    const found = validateStack(draft);
    setIssues(found);
    const first = found[0];
    if (first) {
      toast.error(
        first.kind === 'categoryName'
          ? t('stack.categoryNameRequired')
          : first.kind === 'cubeDuplicate'
            ? t('stack.cubeDuplicate')
            : t('stack.cubeIncomplete'),
      );
      return;
    }
    try {
      const saved = await save.mutateAsync({
        ...draft,
        categories: draft.categories.map((c) => ({
          ...c,
          name: { es: c.name.es.trim(), en: c.name.en.trim() },
        })),
      });
      setDraft(saved);
      setBaseline(JSON.stringify(saved));
      toast.success(t('common.saved'));
    } catch (error) {
      toast.error(t('common.saveError'), error instanceof ApiError ? error.detail : undefined);
    }
  };

  const faceIssue = (face: number) => issues.find((i) => i.kind !== 'categoryName' && i.face === face);

  return (
    <>
      <UnsavedChangesGuard
        when={dirty}
        title={t('common.unsavedTitle')}
        description={t('common.unsavedText')}
        leaveLabel={t('common.leave')}
        stayLabel={t('common.stay')}
      />
      <AdminPageHeader
        breadcrumb={`${t('breadcrumb.content')} / ${t('nav.stack')}`}
        title={t('stack.title')}
        actions={
          <>
            <Button variant="secondary" size="lg" icon={<PlusIcon />} onClick={addCategory}>
              {t('stack.newCategory')}
            </Button>
            <Button
              variant="cobalt"
              size="lg"
              icon={<CheckIcon />}
              onClick={() => void onSave()}
              disabled={save.isPending}
            >
              {save.isPending ? t('common.saving') : t('common.saveChanges')}
            </Button>
          </>
        }
      />

      <section
        aria-labelledby="cube-title"
        className="flex flex-col gap-5 rounded-card bg-night p-5 text-paper sm:p-6"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="cube-title" className="m-0 text-[21px] font-bold">
            {t('stack.cubeTitle')}
          </h2>
          <p className="m-0 text-sm text-night-text">{t('stack.cubeHint')}</p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
          {draft.cube.map((tech, face) => {
            const issue = faceIssue(face);
            const id = `cube-face-${face}`;
            return (
              <div
                key={face}
                className={cn(
                  'flex flex-col gap-2 rounded-2xl border-[1.5px] p-3',
                  FACE_STYLES[face],
                  issue && 'outline-3 outline-offset-2 outline-[#f59a72]',
                )}
              >
                <label htmlFor={id} className="font-mono text-[11px]">
                  {t('stack.face', { n: face + 1 })}
                </label>
                <select
                  id={id}
                  value={tech ?? ''}
                  aria-invalid={issue ? true : undefined}
                  onChange={(e) => {
                    const value = e.target.value || null;
                    setDraft((d) => ({ ...d, cube: d.cube.map((c, i) => (i === face ? value : c)) }));
                    setIssues((prev) => prev.filter((i) => i.kind === 'categoryName' || i.face !== face));
                  }}
                  className="field min-h-11 px-3 py-2 font-semibold"
                >
                  <option value="">{t('stack.choose')}</option>
                  {draft.categories.map((c) => (
                    <optgroup key={c.id} label={c.name.es || '—'}>
                      {c.technologies.map((tName) => (
                        <option key={tName} value={tName}>
                          {tName}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {issue && (
                  <span role="alert" className="text-xs font-medium">
                    {issue.kind === 'cubeDuplicate' ? t('stack.cubeDuplicate') : t('stack.cubeIncomplete')}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
        <SortableList
          layout="grid"
          items={draft.categories}
          screenReaderInstructions={t('common.dndInstructions')}
          onReorder={(categories) => setDraft((d) => ({ ...d, categories }))}
          renderItem={(category, { handleProps, setNodeRef, style, isDragging }) => {
            const nameError = issues.some((i) => i.kind === 'categoryName' && i.categoryId === category.id);
            const label = category.name.es || t('stack.newCategoryName');
            return (
              <li
                ref={setNodeRef}
                style={style}
                className={cn(
                  'flex flex-col gap-4 rounded-card border-[1.5px] border-ink bg-surface p-4 sm:p-5',
                  isDragging && 'shadow-xl',
                )}
              >
                <div className="flex items-center gap-1">
                  <DragHandle label={t('common.dragHandle', { name: label })} {...handleProps} />
                  <label htmlFor={`cat-name-${category.id}`} className="sr-only">
                    {t('stack.categoryNameEs')}
                  </label>
                  <input
                    id={`cat-name-${category.id}`}
                    value={category.name.es}
                    aria-invalid={nameError || undefined}
                    onChange={(e) => {
                      patchCategory(category.id, { name: { ...category.name, es: e.target.value } });
                      if (nameError)
                        setIssues((prev) =>
                          prev.filter((i) => !(i.kind === 'categoryName' && i.categoryId === category.id)),
                        );
                    }}
                    className={cn(
                      'min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-[20px] font-bold tracking-[-0.01em] hover:border-line-strong focus:border-cobalt focus:bg-white focus:outline-none',
                      nameError && 'border-danger',
                    )}
                  />
                  <span className="px-2 font-mono text-xs text-ink-muted">
                    {String(category.technologies.length).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setToDelete(category)}
                    aria-label={t('stack.deleteCategory', { name: label })}
                    className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-danger hover:bg-[#fbe9e2]"
                  >
                    <TrashIcon size={17} />
                  </button>
                </div>
                {nameError && (
                  <p className="m-0 -mt-2 text-[13px] text-danger">{t('stack.categoryNameRequired')}</p>
                )}
                <div className="flex items-center gap-3">
                  <label
                    htmlFor={`cat-en-${category.id}`}
                    className="w-8 font-mono text-[11px] text-ink-muted"
                  >
                    {t('common.en')}
                    <span className="sr-only"> — {t('stack.categoryNameEn')}</span>
                  </label>
                  <input
                    id={`cat-en-${category.id}`}
                    value={category.name.en}
                    onChange={(e) =>
                      patchCategory(category.id, { name: { ...category.name, en: e.target.value } })
                    }
                    className="field min-h-11 py-2"
                  />
                </div>
                <TagInput
                  variant="dashed"
                  value={category.technologies}
                  onChange={(technologies) => patchCategory(category.id, { technologies })}
                  placeholder={t('stack.addTech')}
                  aria-label={t('stack.addTechLabel', { name: label })}
                  removeLabel={(tag) => t('common.removeItem', { name: tag })}
                  onDuplicate={(tag) => toast.error(t('stack.duplicate', { name: tag }))}
                />
              </li>
            );
          }}
        />
      </ul>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t('confirm.deleteTitle', { name: toDelete?.name.es ?? '' })}
        description={t('confirm.deleteCategory', { count: toDelete?.technologies.length ?? 0 })}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          if (toDelete) updateCategories(draft.categories.filter((c) => c.id !== toDelete.id));
          setToDelete(null);
        }}
      />
    </>
  );
}
