/**
 * A Result type that can be used to represent a successful value or an error.
 *
 * Example:
 *
 * ```ts
 * function divide(a: number, b: number): Result<number> {
 *   if (b === 0) {
 *     return Err(new Error('cannot divide by zero'));
 *   }
 *
 *   return Ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 *
 * if (!result.ok) {
 *  throw result.error;
 * }
 *
 * doSomethingWith(result.value);
 *
 * ```
 */
export type Result<T, E = Error | string, ErrorExtras = any> =
  | OkResult<T>
  | ErrResult<E, ErrorExtras>;

export type OkResult<T> = { ok: true; value: T; error?: undefined };
export type ErrResult<E, ErrorExtras = any> = {
  ok: false;
  error: E;
  value?: undefined;
  errorExtras?: ErrorExtras;
};

/**
 * A helper function to create an error Result type
 */
export function Err<E, ErrorExtras>(
  error: E,
  errorExtras?: ErrorExtras,
): ErrResult<E, ErrorExtras> {
  return { ok: false, error, errorExtras };
}

/**
 * A helper function to create a successful Result type
 **/
export function Ok<T>(value: T): OkResult<T> {
  return { ok: true, value };
}