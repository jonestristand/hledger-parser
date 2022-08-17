export type StatusIndicator = 'cleared' | 'pending' | 'unmarked';

export interface Date {
  y: number;
  m: number;
  d: number;
}

export interface PayeeMemo {
  payee: string;
  memo: string;
}

export interface Tag {
  name: string;
  value?: string;
}

export interface Account {
  type: 'real' | 'virtual' | 'virtualBalanced';
  name: string[];
}

export interface Amount {
  value: string;
  commodity: string;
}

export interface LotPrice {
  amount: Amount;
  lotPriceType: 'total' | 'unit';
}

export interface Assertion {
  amount: Amount;
  type: 'strong' | 'normal';
  subaccounts: boolean;
}

export interface Posting {
  account: Account;
  amount?: Amount;
  lotPrice?: LotPrice;
  assertion?: Assertion;
  status: StatusIndicator;
}

export type TxnDescription = string | PayeeMemo;

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}
