import { useMediaQuery } from './use-media-query';

/** true si el usuario pidió reducir el movimiento (en el pre-render siempre false). */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
