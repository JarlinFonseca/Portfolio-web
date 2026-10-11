import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import { cn } from '@/utils/cn';

/** Checkbox nativo con etiqueta clicable y área táctil amplia. */
export const Checkbox = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode; description?: ReactNode }
>(function Checkbox({ label, description, className, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className="mt-[3px] size-5 shrink-0 cursor-pointer accent-cobalt"
        {...(description ? { 'aria-describedby': `${inputId}-desc` } : {})}
        {...props}
      />
      <div className="flex flex-col gap-0.5">
        <label htmlFor={inputId} className="cursor-pointer text-[15px] font-medium">
          {label}
        </label>
        {description && (
          <span id={`${inputId}-desc`} className="text-[13px] text-ink-muted">
            {description}
          </span>
        )}
      </div>
    </div>
  );
});
