import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

/** En desarrollo, los mocks (MSW) arrancan antes de hidratar para que el admin funcione sin backend. */
async function enableMocks() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return;
  const { worker } = await import('@/testing/msw/browser');
  await worker.start({ onUnhandledFrame: 'bypass', quiet: true });
}

void enableMocks().finally(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
});
