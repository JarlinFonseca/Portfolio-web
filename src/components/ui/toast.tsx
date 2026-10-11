import { Toast as ToastPrimitive } from 'radix-ui';
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '@/utils/cn';
import { CheckIcon, CloseIcon } from './icons';

type ToastTone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string | undefined;
}

interface ToastApi {
  show: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const show = useCallback((toast: Omit<ToastItem, 'id'>) => {
    setItems((prev) => [...prev, { ...toast, id: Date.now() + Math.random() }]);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (title, description) => show({ tone: 'success', title, description }),
      error: (title, description) => show({ tone: 'error', title, description }),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={api}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4500}>
        {children}
        {items.map((item) => (
          <ToastPrimitive.Root
            key={item.id}
            type={item.tone === 'error' ? 'foreground' : 'background'}
            onOpenChange={(open) => {
              if (!open) setItems((prev) => prev.filter((i) => i.id !== item.id));
            }}
            className={cn(
              'flex items-start gap-3 rounded-2xl border-[1.5px] border-ink px-4 py-3.5 shadow-[0_18px_40px_-20px_rgba(20,22,26,.5)]',
              item.tone === 'error' ? 'bg-[#fbe9e2] text-ink' : 'bg-ink text-surface',
            )}
          >
            {item.tone === 'success' && (
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-white">
                <CheckIcon size={13} />
              </span>
            )}
            <div className="flex flex-1 flex-col gap-0.5">
              <ToastPrimitive.Title className="text-[15px] font-semibold">{item.title}</ToastPrimitive.Title>
              {item.description && (
                <ToastPrimitive.Description className="text-sm opacity-80">
                  {item.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close
              aria-label="Cerrar"
              className="-m-1 rounded-lg p-1 opacity-70 hover:opacity-100"
            >
              <CloseIcon size={16} />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed right-4 bottom-4 z-[100] m-0 flex w-[min(380px,calc(100vw-32px))] list-none flex-col gap-2.5 p-0 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
