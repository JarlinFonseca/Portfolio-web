import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ProjectImage } from '@/api/admin/model';
import { Badge } from '@/components/ui/badge';
import { Dropzone } from '@/components/ui/dropzone';
import { TrashIcon } from '@/components/ui/icons';
import { useToast } from '@/components/ui/toast';
import { IMAGE_RULE, validateFile } from '@/lib/http/upload';
import { cn } from '@/utils/cn';
import { projectImagesApi, uploadQueue } from '../../api/admin-projects';

export interface PendingImage {
  key: string;
  file: File;
  previewUrl: string;
  alt: string;
}

interface Tile {
  id: string;
  url: string;
  alt: string;
  isCover: boolean;
  pending: boolean;
}

/**
 * Imágenes del proyecto. Con proyecto guardado, cada acción va directo a la API (multipart con progreso).
 * En un proyecto nuevo las imágenes quedan en cola y se suben al guardar (con el id recibido).
 */
export function ImageManager({
  projectId,
  images,
  coverImageId,
  pending,
  onPendingChange,
  pendingCoverKey,
  onPendingCoverChange,
  onChanged,
  blurred,
}: {
  projectId: string | undefined;
  images: ProjectImage[];
  coverImageId: string | null;
  pending: PendingImage[];
  onPendingChange: (pending: PendingImage[]) => void;
  pendingCoverKey: string | null;
  onPendingCoverChange: (key: string) => void;
  onChanged: () => void;
  blurred: boolean;
}) {
  const { t } = useTranslation('admin');
  const toast = useToast();
  const [uploads, setUploads] = useState<{ name: string; progress: number }[]>([]);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});

  const accept = (files: File[]) =>
    files.filter((file) => {
      const problem = validateFile(file, IMAGE_RULE);
      if (problem)
        toast.error(t(problem === 'type' ? 'images.invalidType' : 'images.tooLarge', { name: file.name }));
      return !problem;
    });

  const onFiles = async (files: File[]) => {
    const valid = accept(files);
    if (!valid.length) return;
    if (!projectId) {
      const added = valid.map((file) => ({
        key: `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        alt: '',
      }));
      onPendingChange([...pending, ...added]);
      return;
    }
    setUploads((u) => [...u, ...valid.map((f) => ({ name: f.name, progress: 0 }))]);
    await uploadQueue(valid, async (file) => {
      try {
        await projectImagesApi.upload(projectId, file, '', (progress) =>
          setUploads((u) => u.map((x) => (x.name === file.name ? { ...x, progress } : x))),
        );
        toast.success(t('images.uploaded'));
      } catch {
        toast.error(t('images.uploadError', { name: file.name }));
      } finally {
        setUploads((u) => u.filter((x) => x.name !== file.name));
        onChanged();
      }
    });
  };

  const tiles: Tile[] = projectId
    ? images.map((img, i) => ({
        id: img.id,
        url: img.url,
        alt: altDrafts[img.id] ?? img.alt,
        isCover: coverImageId ? coverImageId === img.id : i === 0,
        pending: false,
      }))
    : pending.map((p, i) => ({
        id: p.key,
        url: p.previewUrl,
        alt: p.alt,
        isCover: pendingCoverKey ? pendingCoverKey === p.key : i === 0,
        pending: true,
      }));

  const setAlt = (tile: Tile, alt: string) => {
    if (tile.pending) onPendingChange(pending.map((p) => (p.key === tile.id ? { ...p, alt } : p)));
    else setAltDrafts((d) => ({ ...d, [tile.id]: alt }));
  };

  const commitAlt = async (tile: Tile) => {
    if (tile.pending || !projectId || altDrafts[tile.id] === undefined) return;
    try {
      await projectImagesApi.update(projectId, tile.id, { alt: tile.alt });
      onChanged();
    } catch {
      toast.error(t('common.saveError'));
    }
  };

  const makeCover = async (tile: Tile) => {
    if (tile.pending) return onPendingCoverChange(tile.id);
    if (!projectId) return;
    try {
      await projectImagesApi.update(projectId, tile.id, { cover: true });
      onChanged();
    } catch {
      toast.error(t('common.saveError'));
    }
  };

  const removeTile = async (tile: Tile) => {
    if (tile.pending) {
      URL.revokeObjectURL(tile.url);
      return onPendingChange(pending.filter((p) => p.key !== tile.id));
    }
    if (!projectId) return;
    try {
      await projectImagesApi.remove(projectId, tile.id);
      toast.success(t('images.removed'));
      onChanged();
    } catch {
      toast.error(t('common.saveError'));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Dropzone
        accept={IMAGE_RULE.types.join(',')}
        onFiles={(files) => void onFiles(files)}
        title={t('images.drop')}
        chooseLabel={t('images.choose')}
        hint={t('images.hint')}
      />

      {uploads.length > 0 && (
        <ul className="m-0 flex list-none flex-col gap-2 p-0" aria-live="polite">
          {uploads.map((u) => (
            <li key={u.name} className="flex flex-col gap-1 text-sm">
              <span>{t('images.uploading', { name: u.name })}</span>
              <progress
                max={100}
                value={u.progress}
                aria-label={t('images.uploading', { name: u.name })}
                className="h-2 w-full accent-cobalt"
              />
            </li>
          ))}
        </ul>
      )}

      {!projectId && pending.length > 0 && (
        <p className="m-0 text-[13px] text-ink-muted">{t('images.pendingNote')}</p>
      )}

      {tiles.length === 0 ? (
        <p className="m-0 text-sm text-ink-muted">{t('images.empty')}</p>
      ) : (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3 p-0">
          {tiles.map((tile, i) => (
            <li
              key={tile.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-line-strong bg-white"
            >
              <div className="relative h-[120px] overflow-hidden bg-[#e6e8e2]">
                <img
                  src={tile.url}
                  alt=""
                  className={cn('size-full object-cover', blurred && 'scale-105 blur-[3px]')}
                />
                {tile.isCover && (
                  <Badge tone="ink" className="absolute top-2 left-2">
                    {t('images.cover')}
                  </Badge>
                )}
                {tile.pending && (
                  <Badge tone="neutral" className="absolute right-2 bottom-2">
                    {t('images.pending')}
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-2 p-2.5">
                <input
                  value={tile.alt}
                  onChange={(e) => setAlt(tile, e.target.value)}
                  onBlur={() => void commitAlt(tile)}
                  placeholder={t('images.alt')}
                  aria-label={t('images.altFor', { n: i + 1 })}
                  className="field min-h-10 px-3 py-2 text-sm"
                />
                <div className="flex items-center justify-between">
                  {tile.isCover ? (
                    <span className="px-1.5 text-sm text-ink-muted">{t('images.cover')}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void makeCover(tile)}
                      className="min-h-11 cursor-pointer px-1.5 text-sm font-medium text-cobalt hover:underline"
                    >
                      {t('images.useCover')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void removeTile(tile)}
                    aria-label={t('images.remove', { n: i + 1 })}
                    className="flex size-11 cursor-pointer items-center justify-center rounded-lg text-danger hover:bg-[#fbe9e2]"
                  >
                    <TrashIcon size={17} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
