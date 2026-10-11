type ClassValue = string | false | null | undefined | 0;

/** Une clases condicionales. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
