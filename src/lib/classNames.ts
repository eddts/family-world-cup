export type ClassValue = string | false | null | undefined;

export function cn(...values: readonly ClassValue[]) {
  return values.filter(Boolean).join(' ');
}
