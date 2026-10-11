import { Switch as SwitchPrimitive } from 'radix-ui';
import { cn } from '@/utils/cn';

/** Interruptor accesible (role="switch"); necesita aria-label o etiqueta asociada. */
export function Switch({
  checked,
  onCheckedChange,
  label,
  id,
  disabled,
  className,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      {...(label ? { 'aria-label': label } : {})}
      {...(id ? { id } : {})}
      className={cn(
        'relative inline-flex h-[26px] w-[44px] shrink-0 cursor-pointer items-center rounded-pill border-[1.5px] transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'border-cobalt bg-cobalt' : 'border-line-strong bg-[#d9dbd4]',
        // área táctil de 44 px
        'before:absolute before:-inset-[9px] before:content-[""]',
        className,
      )}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'block size-[18px] rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[20px]' : 'translate-x-[2px]',
        )}
      />
    </SwitchPrimitive.Root>
  );
}

/** Fila con título, descripción e interruptor (panel «Publicación»). */
export function SwitchRow({
  title,
  description,
  checked,
  onCheckedChange,
  id,
}: {
  title: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="cursor-pointer text-[15px] font-semibold">
          {title}
        </label>
        {description && (
          <span id={`${id}-desc`} className="text-[13px] leading-snug text-ink-muted">
            {description}
          </span>
        )}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
