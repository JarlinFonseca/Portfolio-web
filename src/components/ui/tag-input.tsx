import { forwardRef, type KeyboardEvent, useState } from 'react';
import { cn } from '@/utils/cn';
import { CloseIcon } from './icons';

/**
 * Etiquetas: se agregan con Enter (o coma), se quitan con × o con Backspace en el campo vacío.
 * Evita duplicados (sin distinguir mayúsculas) y avisa con onDuplicate.
 */
export const TagInput = forwardRef<
  HTMLInputElement,
  {
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    removeLabel: (tag: string) => string;
    onDuplicate?: (tag: string) => void;
    onRemove?: (tag: string) => void;
    id?: string;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
    'aria-label'?: string;
    variant?: 'boxed' | 'dashed';
  }
>(function TagInput(
  { value, onChange, placeholder, removeLabel, onDuplicate, onRemove, variant = 'boxed', ...aria },
  ref,
) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const tag = draft.trim().replace(/,$/, '').trim();
    if (!tag) return;
    if (value.some((v) => v.toLowerCase() === tag.toLowerCase())) {
      onDuplicate?.(tag);
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const remove = (tag: string) => {
    onChange(value.filter((v) => v !== tag));
    onRemove?.(tag);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add();
    } else if (event.key === 'Backspace' && !draft) {
      const last = value.at(-1);
      if (last !== undefined) remove(last);
    }
  };

  const chips = (
    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {value.map((tag) => (
        <li
          key={tag}
          className="inline-flex items-center gap-1 rounded-lg bg-chip py-1 pr-1 pl-2.5 font-mono text-xs"
        >
          {tag}
          <button
            type="button"
            onClick={() => remove(tag)}
            aria-label={removeLabel(tag)}
            className="flex size-7 items-center justify-center rounded-md text-ink-muted hover:bg-white hover:text-danger"
          >
            <CloseIcon size={13} />
          </button>
        </li>
      ))}
    </ul>
  );

  if (variant === 'dashed') {
    return (
      <div className="flex flex-col gap-3">
        {chips}
        <input
          ref={ref}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={add}
          placeholder={placeholder}
          className="field min-h-11 border-dashed bg-transparent"
          {...aria}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'field flex min-h-[52px] flex-wrap items-center gap-1.5 px-2 py-1.5 focus-within:border-cobalt focus-within:shadow-[0_0_0_3px_rgba(45,91,227,.18)]',
        aria['aria-invalid'] && 'border-danger',
      )}
    >
      {chips}
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder={placeholder}
        className="min-w-[160px] flex-1 bg-transparent px-2 py-1.5 outline-none"
        {...aria}
      />
    </div>
  );
});
