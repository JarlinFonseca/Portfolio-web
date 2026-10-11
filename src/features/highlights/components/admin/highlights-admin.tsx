import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminHighlights } from '@/api/admin/model';
import { AdminPageHeader } from '@/components/layout/admin-page';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { CheckIcon, PlusIcon, TrashIcon } from '@/components/ui/icons';
import { DragHandle, SortableList } from '@/components/ui/sortable';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import { UnsavedChangesGuard } from '@/components/ui/unsaved-changes-guard';
import { cn } from '@/utils/cn';
import { highlightsErrors, useSaveHighlights } from '../../api';
import { StatsGrid } from '../stats-strip';

type Stat = AdminHighlights['stats'][number];
type Principle = AdminHighlights['principles'][number];

let seq = 0;
const tmpId = (p: string) => `${p}-new-${Date.now().toString(36)}${seq++}`;

function MiniField({
  id,
  label,
  tag,
  invalid,
  multiline,
  value,
  onChange,
  className,
}: {
  id: string;
  label: string;
  tag?: string;
  invalid?: boolean;
  multiline?: boolean;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-[13px] font-semibold">
        {label}
        {tag && <span className="ml-1 font-mono text-[10px] font-normal text-ink-muted">{tag}</span>}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={3}
          value={value}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
          className="field resize-y px-3 py-2 text-[15px] leading-snug"
        />
      ) : (
        <input
          id={id}
          value={value}
          aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value)}
          className="field min-h-11 px-3 py-2 font-semibold"
        />
      )}
    </div>
  );
}

export function HighlightsAdmin({ initial }: { initial: AdminHighlights }) {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const save = useSaveHighlights();
  const [draft, setDraft] = useState(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));
  const [showErrors, setShowErrors] = useState(false);
  const [toDelete, setToDelete] = useState<{ type: 'stat' | 'principle'; id: string; name: string } | null>(
    null,
  );

  const dirty = JSON.stringify(draft) !== baseline;
  const errors = highlightsErrors(draft);

  const patchStat = (id: string, patch: Partial<Stat>) =>
    setDraft((d) => ({ ...d, stats: d.stats.map((s) => (s.id === id ? { ...s, ...patch } : s)) }));
  const patchPrinciple = (id: string, patch: Partial<Principle>) =>
    setDraft((d) => ({ ...d, principles: d.principles.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  const onSave = async () => {
    if (errors.stats.size || errors.principles.size) {
      setShowErrors(true);
      toast.error(t('common.fixErrors'), t('highlights.errors'));
      return;
    }
    try {
      const saved = await save.mutateAsync(draft);
      setDraft(saved);
      setBaseline(JSON.stringify(saved));
      setShowErrors(false);
      toast.success(t('common.saved'));
    } catch {
      toast.error(t('common.saveError'));
    }
  };

  const previewStats = draft.stats
    .filter((s) => s.visible && s.value.trim())
    .map((s) => ({ id: s.id, value: s.value, label: s.label.es }));

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
        breadcrumb={`${t('breadcrumb.content')} / ${t('highlights.title')}`}
        title={t('highlights.title')}
        actions={
          <Button
            variant="cobalt"
            size="lg"
            icon={<CheckIcon />}
            onClick={() => void onSave()}
            disabled={save.isPending}
          >
            {save.isPending ? t('common.saving') : t('common.saveChanges')}
          </Button>
        }
      />

      {showErrors && (errors.stats.size > 0 || errors.principles.size > 0) && (
        <p role="alert" className="m-0 rounded-xl bg-[#fbe9e2] px-4 py-3 text-sm font-medium text-danger">
          {t('highlights.errors')}
        </p>
      )}

      <section aria-labelledby="stats-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="stats-title" className="m-0 text-[22px] font-bold">
              {t('highlights.statsTitle')}
            </h2>
            <p className="m-0 text-sm text-ink-muted">{t('highlights.statsHint')}</p>
          </div>
          <Button
            variant="secondary"
            icon={<PlusIcon />}
            onClick={() =>
              setDraft((d) => ({
                ...d,
                stats: [
                  ...d.stats,
                  { id: tmpId('stat'), value: '', label: { es: '', en: '' }, visible: true },
                ],
              }))
            }
          >
            {t('highlights.addStat')}
          </Button>
        </div>

        <figure className="m-0 flex flex-col gap-2">
          <figcaption className="sr-only">{t('highlights.previewLabel')}</figcaption>
          {previewStats.length ? (
            <div aria-hidden="true">
              <StatsGrid stats={previewStats} />
            </div>
          ) : (
            <p className="m-0 rounded-3xl border-[1.5px] border-dashed border-line-strong p-6 text-sm text-ink-muted">
              {t('highlights.previewEmpty')}
            </p>
          )}
        </figure>

        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          <SortableList
            items={draft.stats}
            screenReaderInstructions={t('common.dndInstructions')}
            onReorder={(stats) => setDraft((d) => ({ ...d, stats }))}
            renderItem={(stat, { handleProps, setNodeRef, style, isDragging }, i) => {
              const name = stat.value || t('highlights.statLabel', { n: i + 1 });
              const invalid = showErrors && errors.stats.has(stat.id);
              return (
                <li
                  ref={setNodeRef}
                  style={style}
                  className={cn(
                    'grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 rounded-2xl border-[1.5px] bg-surface p-3 md:grid-cols-[44px_110px_minmax(0,1fr)_minmax(0,1fr)_auto]',
                    invalid ? 'border-danger' : 'border-line-strong',
                    isDragging && 'shadow-lg',
                  )}
                >
                  <DragHandle
                    label={t('common.dragHandle', { name })}
                    {...handleProps}
                    className="row-span-4 md:row-span-1"
                  />
                  <MiniField
                    id={`stat-v-${stat.id}`}
                    label={t('highlights.value')}
                    value={stat.value}
                    invalid={invalid && !stat.value.trim()}
                    onChange={(value) => patchStat(stat.id, { value })}
                  />
                  <MiniField
                    id={`stat-es-${stat.id}`}
                    label={t('highlights.text')}
                    tag={t('common.es')}
                    value={stat.label.es}
                    invalid={invalid && !stat.label.es.trim()}
                    onChange={(es) => patchStat(stat.id, { label: { ...stat.label, es } })}
                  />
                  <MiniField
                    id={`stat-en-${stat.id}`}
                    label={t('highlights.text')}
                    tag={t('common.en')}
                    value={stat.label.en}
                    onChange={(en) => patchStat(stat.id, { label: { ...stat.label, en } })}
                  />
                  <div className="flex items-center justify-end gap-3 md:pt-6">
                    <Switch
                      checked={stat.visible}
                      label={t('highlights.statToggle', { name })}
                      onCheckedChange={(visible) => patchStat(stat.id, { visible })}
                    />
                    <button
                      type="button"
                      onClick={() => setToDelete({ type: 'stat', id: stat.id, name })}
                      aria-label={t('highlights.deleteStat', { name })}
                      className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-danger hover:bg-[#fbe9e2]"
                    >
                      <TrashIcon size={17} />
                    </button>
                  </div>
                </li>
              );
            }}
          />
        </ul>
      </section>

      <section aria-labelledby="principles-title" className="flex flex-col gap-4 pt-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <h2 id="principles-title" className="m-0 text-[22px] font-bold">
              {t('highlights.principlesTitle')}
            </h2>
            <p className="m-0 text-sm text-ink-muted">{t('highlights.principlesHint')}</p>
          </div>
          <Button
            variant="secondary"
            icon={<PlusIcon />}
            onClick={() =>
              setDraft((d) => ({
                ...d,
                principles: [
                  ...d.principles,
                  { id: tmpId('pr'), title: { es: '', en: '' }, text: { es: '', en: '' } },
                ],
              }))
            }
          >
            {t('highlights.addPrinciple')}
          </Button>
        </div>
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          <SortableList
            items={draft.principles}
            screenReaderInstructions={t('common.dndInstructions')}
            onReorder={(principles) => setDraft((d) => ({ ...d, principles }))}
            renderItem={(pr, { handleProps, setNodeRef, style, isDragging }, i) => {
              const n = String(i + 1).padStart(2, '0');
              const name = pr.title.es || t('highlights.principleLabel', { n: i + 1 });
              const invalid = showErrors && errors.principles.has(pr.id);
              return (
                <li
                  ref={setNodeRef}
                  style={style}
                  className={cn(
                    'grid grid-cols-[44px_minmax(0,1fr)_44px] gap-3 rounded-2xl border-[1.5px] bg-surface p-3',
                    invalid ? 'border-danger' : 'border-line-strong',
                    isDragging && 'shadow-lg',
                  )}
                >
                  <div className="flex flex-col items-center gap-1">
                    <DragHandle label={t('common.dragHandle', { name })} {...handleProps} />
                    <span className="font-mono text-xs text-signal" aria-hidden="true">
                      {n}
                    </span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <MiniField
                      id={`pr-tes-${pr.id}`}
                      label={t('highlights.titleField')}
                      tag={t('common.es')}
                      value={pr.title.es}
                      invalid={invalid && !pr.title.es.trim()}
                      onChange={(es) => patchPrinciple(pr.id, { title: { ...pr.title, es } })}
                    />
                    <MiniField
                      id={`pr-ten-${pr.id}`}
                      label={t('highlights.titleField')}
                      tag={t('common.en')}
                      value={pr.title.en}
                      onChange={(en) => patchPrinciple(pr.id, { title: { ...pr.title, en } })}
                    />
                    <MiniField
                      id={`pr-xes-${pr.id}`}
                      multiline
                      label={t('highlights.text')}
                      tag={t('common.es')}
                      value={pr.text.es}
                      invalid={invalid && !pr.text.es.trim()}
                      onChange={(es) => patchPrinciple(pr.id, { text: { ...pr.text, es } })}
                    />
                    <MiniField
                      id={`pr-xen-${pr.id}`}
                      multiline
                      label={t('highlights.text')}
                      tag={t('common.en')}
                      value={pr.text.en}
                      onChange={(en) => patchPrinciple(pr.id, { text: { ...pr.text, en } })}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setToDelete({ type: 'principle', id: pr.id, name })}
                    aria-label={t('highlights.deletePrinciple', { name })}
                    className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-danger hover:bg-[#fbe9e2]"
                  >
                    <TrashIcon size={17} />
                  </button>
                </li>
              );
            }}
          />
        </ol>
      </section>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t('confirm.deleteTitle', { name: toDelete?.name ?? '' })}
        description={t('confirm.deleteGeneric')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          if (toDelete?.type === 'stat')
            setDraft((d) => ({ ...d, stats: d.stats.filter((s) => s.id !== toDelete.id) }));
          if (toDelete?.type === 'principle')
            setDraft((d) => ({ ...d, principles: d.principles.filter((p) => p.id !== toDelete.id) }));
          setToDelete(null);
        }}
      />
    </>
  );
}
