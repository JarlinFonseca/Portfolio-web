import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { DragIcon } from './icons';

export interface SortableRenderProps {
  handleProps: HTMLAttributes<HTMLButtonElement>;
  setNodeRef: (node: HTMLElement | null) => void;
  style: CSSProperties;
  isDragging: boolean;
}

/**
 * Lista reordenable con puntero y teclado (dnd-kit).
 * `onReorder` recibe la lista nueva; el que llama decide si es optimista y si revierte.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  disabled = false,
  layout = 'vertical',
  screenReaderInstructions,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, props: SortableRenderProps, index: number) => ReactNode;
  disabled?: boolean;
  layout?: 'vertical' | 'grid';
  screenReaderInstructions: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = items.findIndex((i) => i.id === active.id);
    const to = items.findIndex((i) => i.id === over.id);
    if (from >= 0 && to >= 0) onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{ screenReaderInstructions: { draggable: screenReaderInstructions } }}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={layout === 'grid' ? rectSortingStrategy : verticalListSortingStrategy}
        disabled={disabled}
      >
        {items.map((item, index) => (
          <SortableItem key={item.id} id={item.id} disabled={disabled}>
            {(props) => renderItem(item, props, index)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  disabled,
  children,
}: {
  id: string;
  disabled: boolean;
  children: (props: SortableRenderProps) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });
  return children({
    handleProps: { ...attributes, ...listeners },
    setNodeRef,
    style: {
      transform: CSS.Translate.toString(transform),
      transition,
      position: 'relative',
      zIndex: isDragging ? 5 : undefined,
    },
    isDragging,
  });
}

/** Control de arrastre (⋮⋮) con nombre accesible. */
export function DragHandle({
  label,
  disabled,
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={cn(
        'flex size-11 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-[#9a9ea6] hover:bg-chip hover:text-ink active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-40',
        className,
      )}
      {...props}
    >
      <DragIcon />
    </button>
  );
}
