import { type DragEvent, type ReactNode, useId, useRef, useState } from 'react';
import { cn } from '@/utils/cn';
import { UploadIcon } from './icons';

/** Zona de arrastre con un <input type="file"> real (funciona con teclado y lectores de pantalla). */
export function Dropzone({
  accept,
  multiple = true,
  onFiles,
  title,
  chooseLabel,
  hint,
  disabled,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title: ReactNode;
  chooseLabel: string;
  hint: ReactNode;
  disabled?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    if (disabled) return;
    const files = Array.from(event.dataTransfer.files);
    if (files.length) onFiles(multiple ? files : files.slice(0, 1));
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      className={cn(
        'flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors',
        over ? 'border-cobalt bg-cobalt-soft' : 'border-line-strong bg-surface',
      )}
    >
      <span className="flex size-[52px] items-center justify-center rounded-2xl bg-cobalt-soft text-cobalt">
        <UploadIcon size={22} />
      </span>
      <p className="m-0 text-[17px] font-semibold">
        {title}{' '}
        <label htmlFor={inputId} className="cursor-pointer text-cobalt underline underline-offset-4">
          {chooseLabel}
        </label>
      </p>
      <p className="m-0 text-[13px] text-ink-muted">{hint}</p>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onFiles(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
