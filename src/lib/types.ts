export type StatusIndicator = 'cleared' | 'pending' | 'unmarked';

/**
 * Type representing a [hledger simple date](https://hledger.org/1.26/hledger.html#simple-dates)
 */
export interface Date {
  y: number;
  m: number;
  d: number;
}

/**
 * Type for a [payee and memo transaction description](https://hledger.org/1.26/hledger.html#payee-and-note)
 */
export interface PayeeMemo {
  payee: string;
  memo: string;
}

/**
 * Type for a [hledger comment tag](https://hledger.org/1.26/hledger.html#tags-1)
 */
export interface Tag {
  name: string;
  value?: string;
}

/**
 * Type for an [hledger account](https://hledger.org/1.26/hledger.html#account-names),
 * including whether the account is being referred to as a [real, virtual, or virtual
 * balanced posting](https://hledger.org/1.26/hledger.html#virtual-postings)
 */
export interface Account {
  type: 'real' | 'virtual' | 'virtualBalanced';
  name: string[];
}

/**
 * Type for an [hledger amount](https://hledger.org/1.26/hledger.html#amounts) including
 * the value and commodity name.
 */
export interface Amount {
  value: string;
  number: string;
  commodity?: string;
  sign?: '-' | '+';
}

/**
 * Type for an [hledger lot price](https://hledger.org/1.26/hledger.html#lot-prices-lot-dates),
 * either the total lot price or unit lot price.
 */
export interface LotPrice {
  amount: Amount;
  lotPriceType: 'total' | 'unit';
}

/**
 * Type for an [hledger balance assertion](https://hledger.org/1.26/hledger.html#balance-assertions)
 */
export interface Assertion {
  amount: Amount;
  type: 'strong' | 'normal';
  subaccounts: boolean;
}

/**
 * Type for a [hledger transaction posting](https://hledger.org/1.26/hledger.html#postings)
 */
export interface Posting {
  account: Account;
  amount?: Amount;
  lotPrice?: LotPrice;
  assertion?: Assertion;
  status: StatusIndicator;
}

/**
 * Type for a hledger transaction description, can be either text or a
 * payee and memo combination
 */
export type TxnDescription = string | PayeeMemo;
