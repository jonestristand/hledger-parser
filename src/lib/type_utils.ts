import { PayeeMemo, TxnDescription } from './types';

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

export function descriptionIsPayeeMemo(
  description: TxnDescription
): description is PayeeMemo {
  return !!(
    typeof description !== 'string' &&
    description.memo &&
    description.payee
  );
}
