import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { AdminProject } from '@/api/admin/model';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { LockIcon, PencilIcon, SearchIcon, TrashIcon } from '@/components/ui/icons';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { DragHandle, SortableList } from '@/components/ui/sortable';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/utils/cn';
import { useDeleteProject, useReorderProjects, useToggleVisibility } from '../../api/admin-projects';
import { matchesFilter, type ProjectFilterValue } from '../../utils/filter-projects';
import { searchProjects } from '../../utils/search-projects';
import { makeBars } from '../public/card-header-visual';

function Thumbnail({ project, index }: { project: AdminProject; index: number }) {
  const cover = project.images.find((i) => i.id === project.coverImageId) ?? project.images[0];
  if (cover) {
    return (
      <img
        src={cover.url}
        alt=""
        className={cn(
          'h-[46px] w-[66px] shrink-0 rounded-[10px] border border-line-strong object-cover',
          project.blurImages && 'blur-[2px]',
        )}
      />
    );
  }
  if (project.type === 'PRIVATE') {
    return (
      <span className="flex h-[46px] w-[66px] shrink-0 items-center justify-center rounded-[10px] border border-line-strong bg-[#e6e8e2] text-ink-muted">
        <LockIcon size={15} />
      </span>
    );
  }
  return (
    <svg aria-hidden="true" width="66" height="46" className="shrink-0 rounded-[10px] bg-ink">
      {makeBars(index + 3, true)
        .slice(0, 3)
        .map((b, i) => (
          <rect
            key={i}
            x="9"
            y={13 + i * 7}
            width={i === 1 ? 40 : 24}
            height="3.5"
            rx="1.75"
            fill={b.color}
          />
        ))}
    </svg>
  );
}

export function ProjectsTable({ projects }: { projects: AdminProject[] }) {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ProjectFilterValue>('all');
  const [toDelete, setToDelete] = useState<AdminProject | null>(null);
  const reorder = useReorderProjects();
  const toggle = useToggleVisibility();
  const remove = useDeleteProject();

  const visible = useMemo(
    () => searchProjects(projects, query).filter((p) => matchesFilter(p.type, filter)),
    [projects, query, filter],
  );
  const canReorder = !query.trim() && filter === 'all';
  const indexOf = (id: string) => projects.findIndex((p) => p.id === id);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-[min(100%,280px)] flex-1">
          <span className="sr-only">{t('projects.searchLabel')}</span>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('projects.search')}
            className="field min-h-12 pl-11"
          />
        </label>
        <SegmentedControl
          appearance="tabs"
          label={t('projects.filterLabel')}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('projects.all') },
            { value: 'private', label: t('projects.private') },
            { value: 'open', label: t('projects.open') },
          ]}
        />
        <p className="m-0 ml-auto font-mono text-xs text-ink-muted" aria-live="polite">
          {canReorder ? t('projects.dragHint') : t('projects.reorderDisabled')}
        </p>
      </div>

      <div className="overflow-hidden rounded-card border-[1.5px] border-ink bg-surface">
        <div
          aria-hidden="true"
          className="hidden grid-cols-[52px_minmax(0,1fr)_150px_200px_80px_96px] items-center gap-3 border-b border-line px-3 py-4 font-mono text-xs text-ink-muted md:grid"
        >
          <span />
          <span>{t('projects.colProject')}</span>
          <span>{t('projects.colType')}</span>
          <span className="hidden lg:block">{t('projects.colTech')}</span>
          <span>{t('projects.colVisible')}</span>
          <span className="text-right">{t('projects.colActions')}</span>
        </div>
        {visible.length === 0 ? (
          <p className="m-0 p-8 text-ink-muted">{t('projects.empty')}</p>
        ) : (
          <ul className="m-0 list-none p-0" aria-label={t('projects.title')}>
            <SortableList
              items={visible}
              disabled={!canReorder || reorder.isPending}
              screenReaderInstructions={t('common.dndInstructions')}
              onReorder={(items) =>
                reorder.mutate(items, {
                  onSuccess: () => toast.success(t('common.reorderSaved')),
                  onError: () => toast.error(t('common.reorderError')),
                })
              }
              renderItem={(project, { handleProps, setNodeRef, style, isDragging }) => {
                const title = project.title.es;
                return (
                  <li
                    ref={setNodeRef}
                    style={style}
                    className={cn(
                      'grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-b border-line px-3 py-3 last:border-b-0 hover:bg-[#f4f5f1] md:grid-cols-[52px_minmax(0,1fr)_150px_200px_80px_96px] max-lg:md:grid-cols-[52px_minmax(0,1fr)_150px_80px_96px]',
                      isDragging && 'bg-white shadow-lg',
                    )}
                  >
                    <DragHandle
                      label={t('common.dragHandle', { name: title })}
                      disabled={!canReorder}
                      {...handleProps}
                    />
                    <div className="flex min-w-0 items-center gap-3.5">
                      <Thumbnail project={project} index={indexOf(project.id)} />
                      <div className="flex min-w-0 flex-col">
                        <span className="flex flex-wrap items-center gap-2 text-[16px] font-semibold">
                          <span className="min-w-0 break-words">{title}</span>
                          {project.featured && <Badge tone="signal">{t('projects.featured')}</Badge>}
                        </span>
                        <span className="text-sm text-ink-muted">{project.organization}</span>
                      </div>
                    </div>
                    <span className="col-start-2 md:col-start-auto">
                      {project.type === 'PRIVATE' ? (
                        <Badge tone="ink">{t('projects.typePrivate')}</Badge>
                      ) : (
                        <Badge tone="success-soft">{t('projects.typeOpen')}</Badge>
                      )}
                    </span>
                    <span className="hidden truncate text-sm text-ink-soft lg:block">
                      {project.technologies.slice(0, 3).join(' · ')}
                    </span>
                    <span className="col-start-2 row-start-3 flex items-center md:col-start-auto md:row-start-auto">
                      <Switch
                        checked={project.visible}
                        label={t('projects.toggleVisible', { name: title })}
                        onCheckedChange={(checked) =>
                          toggle.mutate(
                            { id: project.id, visible: checked },
                            {
                              onSuccess: () =>
                                toast.success(
                                  t(checked ? 'projects.visibleOn' : 'projects.visibleOff', { name: title }),
                                ),
                              onError: () => toast.error(t('common.saveError')),
                            },
                          )
                        }
                      />
                    </span>
                    <span className="col-start-3 row-span-3 row-start-1 flex justify-end gap-1 md:col-start-auto md:row-span-1 md:row-start-auto">
                      <Link
                        to={`/admin/projects/${project.id}`}
                        aria-label={t('projects.editLabel', { name: title })}
                        className="flex size-11 items-center justify-center rounded-lg hover:bg-chip"
                      >
                        <PencilIcon />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setToDelete(project)}
                        aria-label={t('projects.deleteLabel', { name: title })}
                        className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-danger hover:bg-[#fbe9e2]"
                      >
                        <TrashIcon />
                      </button>
                    </span>
                  </li>
                );
              }}
            />
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t('confirm.deleteTitle', { name: toDelete?.title.es ?? '' })}
        description={t('confirm.deleteProject')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        busy={remove.isPending}
        onConfirm={() => {
          if (!toDelete) return;
          remove.mutate(toDelete.id, {
            onSuccess: () => toast.success(t('projects.deleted')),
            onError: () => toast.error(t('common.saveError')),
            onSettled: () => setToDelete(null),
          });
        }}
      />
    </div>
  );
}
