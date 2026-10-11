import { useEffect } from 'react';
import { useBlocker } from 'react-router';
import { ConfirmDialog } from './confirm-dialog';

/**
 * Pide confirmación antes de salir con cambios sin guardar (navegación interna con useBlocker
 * y cierre o recarga de la pestaña con beforeunload).
 */
export function UnsavedChangesGuard({
  when,
  title,
  description,
  leaveLabel,
  stayLabel,
}: {
  when: boolean;
  title: string;
  description: string;
  leaveLabel: string;
  stayLabel: string;
}) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => when && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (!when) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [when]);

  return (
    <ConfirmDialog
      open={blocker.state === 'blocked'}
      onOpenChange={(open) => {
        if (!open && blocker.state === 'blocked') blocker.reset();
      }}
      title={title}
      description={description}
      confirmLabel={leaveLabel}
      cancelLabel={stayLabel}
      onConfirm={() => blocker.state === 'blocked' && blocker.proceed()}
    />
  );
}
