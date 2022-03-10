/**
 * Type describing the allowed values for a boolean input.
 */
export type BooleanInput = string | boolean | null | undefined;

/** Coerces a data-bound value (typically a string) to a boolean. */
export function coerceBooleanProperty(value: any): boolean {
  return value != null && `${value}` !== 'false';
}
