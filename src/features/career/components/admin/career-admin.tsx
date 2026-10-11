import { Tabs } from 'radix-ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CareerKind } from '@/api/admin/model';
import { compareExperience } from '@/api/public-portfolio/resolve-localized';
import { AdminPageHeader, AdminStatus } from '@/components/layout/admin-page';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { PlusIcon, TrashIcon } from '@/components/ui/icons';
import { DragHandle, SortableList } from '@/components/ui/sortable';
import { useToast } from '@/components/ui/toast';
import { UnsavedChangesGuard } from '@/components/ui/unsaved-changes-guard';
import { cn } from '@/utils/cn';
import { formatMonth, formatRange, yearOf } from '@/utils/format-month';
import {
  ORDERABLE,
  type CareerItemMap,
  useCareerList,
  useDeleteCareerItem,
  useReorderCareer,
  useSaveCareerItem,
} from '../../api';
import { emptyForms, fromForm, toForm } from '../../schemas';
import { CertificationEditor, EducationEditor, ExperienceEditor, LanguageEditor } from './career-forms';

const KINDS: CareerKind[] = ['experience', 'education', 'certifications', 'languages'];
type AnyItem = CareerItemMap[CareerKind];
type Selection = string | 'new' | null;

export function CareerAdmin() {
  const { t } = useTranslation('admin');
  const [kind, setKind] = useState<CareerKind>('experience');
  const [selection, setSelection] = useState<Record<CareerKind, Selection>>({
    experience: null,
    education: null,
    certifications: null,
    languages: null,
  });
  const [dirty, setDirty] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const lists = {
    experience: useCareerList('experience'),
    education: useCareerList('education'),
    certifications: useCareerList('certifications'),
    languages: useCareerList('languages'),
  };

  /** Protege los cambios sin guardar al cambiar de registro o de pestaña. */
  const guard = (action: () => void) => (dirty ? setPendingAction(() => action) : action());

  const select = (k: CareerKind, value: Selection) => setSelection((s) => ({ ...s, [k]: value }));

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
        breadcrumb={`${t('breadcrumb.content')} / ${t('career.title')}`}
        title={t('career.title')}
        actions={
          <Button
            variant="cobalt"
            size="lg"
            icon={<PlusIcon />}
            onClick={() => guard(() => select(kind, 'new'))}
          >
            {t(`career.new.${kind}`)}
          </Button>
        }
      />

      <Tabs.Root
        value={kind}
        onValueChange={(v) => guard(() => setKind(v as CareerKind))}
        className="flex flex-col gap-6"
      >
        <Tabs.List
          aria-label={t('career.tabsLabel')}
          className="flex [scrollbar-width:none] gap-1 overflow-x-auto border-b border-line-strong"
        >
          {KINDS.map((k) => (
            <Tabs.Trigger
              key={k}
              value={k}
              className="-mb-px flex min-h-12 shrink-0 cursor-pointer items-center gap-2 border-b-[2.5px] border-transparent px-4 text-[16px] whitespace-nowrap text-ink-soft hover:text-ink data-[state=active]:border-cobalt data-[state=active]:font-semibold data-[state=active]:text-ink"
            >
              {t(`career.tab.${k}`)}
              <span className="rounded-pill bg-chip px-2 py-0.5 font-mono text-[11px] text-ink-muted in-data-[state=active]:bg-cobalt-soft in-data-[state=active]:text-cobalt">
                {lists[k].data?.length ?? '…'}
              </span>
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {KINDS.map((k) => (
          <Tabs.Content key={k} value={k} className="outline-none">
            <CareerTab
              kind={k}
              selection={selection[k]}
              onSelect={(value) => guard(() => select(k, value))}
              onSelectNow={(value) => select(k, value)}
              onDirtyChange={setDirty}
            />
          </Tabs.Content>
        ))}
      </Tabs.Root>

      <ConfirmDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={t('common.unsavedTitle')}
        description={t('common.unsavedText')}
        confirmLabel={t('common.leave')}
        cancelLabel={t('common.stay')}
        onConfirm={() => {
          setDirty(false);
          pendingAction?.();
          setPendingAction(null);
        }}
      />
    </>
  );
}

function CareerTab({
  kind,
  selection,
  onSelect,
  onSelectNow,
  onDirtyChange,
}: {
  kind: CareerKind;
  selection: Selection;
  onSelect: (value: Selection) => void;
  onSelectNow: (value: Selection) => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { t, i18n } = useTranslation('admin');
  const toast = useToast();
  const list = useCareerList(kind);
  const save = useSaveCareerItem(kind);
  const remove = useDeleteCareerItem(kind);
  const reorder = useReorderCareer(kind);
  const [toDelete, setToDelete] = useState<AnyItem | null>(null);
  const lang = i18n.language === 'en' ? 'en' : 'es';

  const items: AnyItem[] = useMemo(
    () =>
      kind === 'experience'
        ? [...((list.data ?? []) as CareerItemMap['experience'][])].sort(compareExperience)
        : (list.data ?? []),
    [kind, list.data],
  );

  // Por defecto queda seleccionado el primer registro
  useEffect(() => {
    if (selection === null && items[0]) onSelectNow(items[0].id);
  }, [selection, items, onSelectNow]);

  const handleDirty = useCallback((d: boolean) => onDirtyChange(d), [onDirtyChange]);

  if (list.isPending) return <AdminStatus state="loading" message={t('common.loading')} />;
  if (list.isError)
    return (
      <AdminStatus
        state="error"
        message={t('common.loadError')}
        retryLabel={t('common.retry')}
        onRetry={() => void list.refetch()}
      />
    );

  const selected = selection && selection !== 'new' ? items.find((i) => i.id === selection) : undefined;
  const orderable = ORDERABLE[kind];

  const submit = async (input: unknown) => {
    try {
      const result = await save.mutateAsync({
        id: selected?.id,
        input: input as Omit<CareerItemMap[typeof kind], 'id'>,
      });
      onDirtyChange(false);
      onSelectNow(result.id);
      toast.success(t('career.saved'));
    } catch {
      toast.error(t('common.saveError'));
    }
  };

  const describe = (item: AnyItem) => describeItem(kind, item, lang, t);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
      <div className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="m-0 rounded-2xl border border-dashed border-line-strong p-6 text-sm text-ink-muted">
            {t('career.empty')}
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0" aria-label={t(`career.tab.${kind}`)}>
            <SortableList
              items={items}
              disabled={!orderable || reorder.isPending}
              screenReaderInstructions={t('common.dndInstructions')}
              onReorder={(next) =>
                reorder.mutate(next as never, {
                  onSuccess: () => toast.success(t('common.reorderSaved')),
                  onError: () => toast.error(t('common.reorderError')),
                })
              }
              renderItem={(item, { handleProps, setNodeRef, style, isDragging }) => {
                const d = describe(item);
                const active = item.id === selection;
                return (
                  <li
                    ref={setNodeRef}
                    style={style}
                    className={cn(
                      'flex items-center gap-1 rounded-2xl border-[1.5px] bg-surface py-2 pr-2 pl-1 transition-colors',
                      active
                        ? 'border-cobalt shadow-[0_0_0_3px_rgba(45,91,227,.15)]'
                        : 'border-line-strong hover:border-ink',
                      isDragging && 'shadow-lg',
                      !orderable && 'pl-4',
                    )}
                  >
                    {orderable && (
                      <DragHandle label={t('common.dragHandle', { name: d.title })} {...handleProps} />
                    )}
                    <button
                      type="button"
                      aria-current={active ? 'true' : undefined}
                      onClick={() => onSelect(item.id)}
                      className="flex min-w-0 flex-1 cursor-pointer flex-col items-start gap-0.5 py-1 text-left"
                    >
                      <span className="text-[17px] leading-snug font-bold">{d.title}</span>
                      {d.subtitle && <span className="text-sm text-ink-soft">{d.subtitle}</span>}
                      <span className="flex flex-wrap items-center gap-2 font-mono text-xs text-ink-muted">
                        {d.meta}
                        {d.hidden && <Badge tone="neutral">{t('career.hidden')}</Badge>}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setToDelete(item)}
                      aria-label={`${t('common.delete')} «${d.title}»`}
                      className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-danger hover:bg-[#fbe9e2]"
                    >
                      <TrashIcon size={17} />
                    </button>
                  </li>
                );
              }}
            />
          </ul>
        )}
        <p className="m-0 px-1 text-[13px] text-ink-muted">
          {orderable ? t('career.dragNote') : t('career.sortNote')}
        </p>
      </div>

      {selection === 'new' || selected ? (
        <CareerEditor
          key={`${kind}-${selection}`}
          kind={kind}
          item={selected}
          saving={save.isPending}
          onSubmit={submit}
          onDirtyChange={handleDirty}
        />
      ) : null}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t('confirm.deleteTitle', { name: toDelete ? describe(toDelete).title : '' })}
        description={t('confirm.deleteGeneric')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        busy={remove.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          remove.mutate(toDelete.id, {
            onSuccess: () => {
              toast.success(t('career.deleted'));
              if (selection === toDelete.id) onSelectNow(null);
            },
            onError: () => toast.error(t('common.saveError')),
            onSettled: () => setToDelete(null),
          });
        }}
      />
    </div>
  );
}

function CareerEditor({
  kind,
  item,
  saving,
  onSubmit,
  onDirtyChange,
}: {
  kind: CareerKind;
  item: AnyItem | undefined;
  saving: boolean;
  onSubmit: (input: unknown) => Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const { t } = useTranslation('admin');
  const common = {
    title: item ? t(`career.edit.${kind}`) : t(`career.new.${kind}`),
    kindLabel: t(`career.kindLabel.${kind}`),
    saving,
    onDirtyChange,
  };
  switch (kind) {
    case 'experience':
      return (
        <ExperienceEditor
          {...common}
          defaultValues={
            item ? toForm.experience(item as CareerItemMap['experience']) : emptyForms.experience()
          }
          onSubmit={(v) => onSubmit(fromForm.experience(v))}
        />
      );
    case 'education':
      return (
        <EducationEditor
          {...common}
          defaultValues={item ? toForm.education(item as CareerItemMap['education']) : emptyForms.education()}
          onSubmit={(v) => onSubmit(fromForm.education(v))}
        />
      );
    case 'certifications':
      return (
        <CertificationEditor
          {...common}
          defaultValues={
            item
              ? toForm.certifications(item as CareerItemMap['certifications'])
              : emptyForms.certifications()
          }
          onSubmit={(v) => onSubmit(fromForm.certifications(v))}
        />
      );
    case 'languages':
      return (
        <LanguageEditor
          {...common}
          defaultValues={item ? toForm.languages(item as CareerItemMap['languages']) : emptyForms.languages()}
          onSubmit={(v) => onSubmit(fromForm.languages(v))}
        />
      );
  }
}

type T = ReturnType<typeof useTranslation<'admin'>>['t'];

function describeItem(
  kind: CareerKind,
  item: AnyItem,
  lang: 'es' | 'en',
  t: T,
): { title: string; subtitle?: string; meta: string; hidden?: boolean } {
  switch (kind) {
    case 'experience': {
      const e = item as CareerItemMap['experience'];
      return {
        title: e.company || t('career.untitled'),
        subtitle: e.role.es,
        meta: e.current
          ? `${formatMonth(e.startMonth, lang)} — ${t('career.present')}`
          : formatRange(e.startMonth, e.endMonth, lang),
      };
    }
    case 'education': {
      const e = item as CareerItemMap['education'];
      const years = [yearOf(e.startMonth), yearOf(e.endMonth)].filter(Boolean).join(' — ');
      return {
        title: e.institution || t('career.untitled'),
        subtitle: e.program.es,
        meta: years,
        hidden: !e.visible,
      };
    }
    case 'certifications': {
      const c = item as CareerItemMap['certifications'];
      return {
        title: c.name || t('career.untitled'),
        subtitle: `${c.issuer} · ${t(c.kind === 'COURSE' ? 'career.kindCOURSE' : 'career.kindCERTIFICATION')}`,
        meta: yearOf(c.issuedMonth),
        hidden: !c.visible,
      };
    }
    case 'languages': {
      const l = item as CareerItemMap['languages'];
      return { title: l.name.es || t('career.untitled'), meta: t(`career.levels.${l.level}`) };
    }
  }
}
