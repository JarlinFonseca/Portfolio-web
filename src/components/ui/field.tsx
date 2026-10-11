import {
  cloneElement,
  forwardRef,
  isValidElement,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
} from 'react';
import { cn } from '@/utils/cn';

/**
 * Etiqueta + control + ayuda + error, con <label> asociado, aria-invalid y aria-describedby.
 * El control (Input, Textarea, select…) se pasa como hijo y recibe id y atributos ARIA.
 */
export function Field({
  label,
  tag,
  optional,
  hint,
  error,
  className,
  children,
}: {
  label: ReactNode;
  /** Sufijo pequeño junto a la etiqueta (ES / EN). */
  tag?: string;
  optional?: string;
  hint?: ReactNode;
  error?: string | undefined;
  className?: string;
  children: ReactElement<Record<string, unknown>>;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: (children.props.id as string | undefined) ?? id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })
    : children;
  const controlId = (children.props.id as string | undefined) ?? id;

  return (
    <div className={cn('flex min-w-0 flex-col gap-2', className)}>
      <label htmlFor={controlId} className="text-[15px] font-semibold text-ink">
        {label}
        {tag && <span className="ml-1.5 font-mono text-[11px] font-normal text-ink-muted">{tag}</span>}
        {optional && <span className="ml-1 font-normal text-ink-muted">{optional}</span>}
      </label>
      {control}
      {hint && (
        <p id={hintId} className="m-0 text-[13px] leading-snug text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="m-0 text-[13px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn('field min-h-12', className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, rows = 4, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        className={cn('field resize-y leading-relaxed', className)}
        {...props}
      />
    );
  },
);

/** Campo con prefijo fijo (mailto:, linkedin.com/in/…). */
export const PrefixedInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { prefix: string }
>(function PrefixedInput({ prefix, className, ...props }, ref) {
  return (
    <div className="field flex min-h-12 items-stretch overflow-hidden p-0 focus-within:border-cobalt focus-within:shadow-[0_0_0_3px_rgba(45,91,227,.18)]">
      <span className="flex items-center border-r border-line-strong bg-chip px-3 font-mono text-xs text-ink-muted">
        {prefix}
      </span>
      <input
        ref={ref}
        className={cn('min-w-0 flex-1 bg-transparent px-3 py-3 outline-none', className)}
        {...props}
      />
    </div>
  );
});
