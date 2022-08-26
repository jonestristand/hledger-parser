//import { PayeeMemo, TxnDescription } from './types';

/**
 * Utility method to filter null and undefined values from an array and
 * return the correct type
 * @param value value to check for *null-ness*
 * @returns A boolean type assertion that value is not nullish
 */
export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

/*export function descriptionIsPayeeMemo(
  description: TxnDescription
): description is PayeeMemo {
  return !!(
    typeof description !== 'string' &&
    description.memo &&
    description.payee
  );
}
*/
