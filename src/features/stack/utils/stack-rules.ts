import type { AdminStack } from '@/api/admin/model';

export type StackIssue =
  | { kind: 'categoryName'; categoryId: string }
  | { kind: 'cubeEmpty'; face: number }
  | { kind: 'cubeDuplicate'; face: number };

/** Validación antes de guardar: nombre en español, 6 caras elegidas, existentes y sin repetir. */
export function validateStack(stack: AdminStack): StackIssue[] {
  const issues: StackIssue[] = [];
  const all = new Set(stack.categories.flatMap((c) => c.technologies));
  stack.categories.forEach((c) => {
    if (!c.name.es.trim()) issues.push({ kind: 'categoryName', categoryId: c.id });
  });
  const seen = new Set<string>();
  stack.cube.forEach((tech, face) => {
    if (!tech || !all.has(tech)) issues.push({ kind: 'cubeEmpty', face });
    else if (seen.has(tech)) issues.push({ kind: 'cubeDuplicate', face });
    else seen.add(tech);
  });
  return issues;
}

/**
 * RF-STK-07: al quitar una tecnología (o su categoría) que estaba en el cubo, esa cara queda vacía
 * para obligar a elegir otra. Devuelve el stack nuevo y las caras afectadas.
 */
export function releaseCubeFaces(stack: AdminStack): {
  stack: AdminStack;
  freed: { face: number; tech: string }[];
} {
  const all = new Set(stack.categories.flatMap((c) => c.technologies));
  const freed: { face: number; tech: string }[] = [];
  const cube = stack.cube.map((tech, face) => {
    if (tech && !all.has(tech)) {
      freed.push({ face, tech });
      return null;
    }
    return tech;
  });
  return { stack: { ...stack, cube }, freed };
}

export function hasDuplicate(list: readonly string[], value: string) {
  return list.some((v) => v.toLowerCase() === value.trim().toLowerCase());
}
