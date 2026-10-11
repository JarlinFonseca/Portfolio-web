import { AlertDialog } from 'radix-ui';
import type { ReactNode } from 'react';
import { buttonClasses } from './button';

/** Diálogo de confirmación: foco atrapado, cierre con Esc y acción destructiva explícita. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  tone = 'danger',
  busy = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  tone?: 'danger' | 'primary';
  busy?: boolean;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-[2px]" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 flex w-[min(460px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-card border-[1.5px] border-ink bg-surface p-6 shadow-[0_30px_60px_-30px_rgba(20,22,26,.6)] focus:outline-none">
          <AlertDialog.Title className="m-0 text-[22px] leading-tight font-bold tracking-[-0.02em]">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="m-0 text-[15px] leading-relaxed text-ink-soft">
            {description}
          </AlertDialog.Description>
          <div className="mt-2 flex flex-wrap justify-end gap-2.5">
            <AlertDialog.Cancel className={buttonClasses('secondary', 'md')}>
              {cancelLabel}
            </AlertDialog.Cancel>
            <AlertDialog.Action
              className={buttonClasses(tone === 'danger' ? 'danger' : 'primary', 'md')}
              disabled={busy}
              onClick={(event) => {
                event.preventDefault();
                onConfirm();
              }}
            >
              {confirmLabel}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
