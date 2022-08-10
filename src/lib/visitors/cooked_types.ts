import * as Core from '../types';

export interface Journal {
  transactions: Transaction[];
  accounts: Account[];
  prices: Price[];
}

export interface Transaction {
  date: Core.Date;
  postingDate?: Core.Date;
  status: Core.StatusIndicator;
  chequeNumber?: string;
  description: Core.TxnDescription;
  postings: Posting[];
  tags: Core.Tag[];
}

export type Posting = Core.Posting & { tags: Core.Tag[] };

export interface Account {
  account: string[];
  tags: Core.Tag[];
}

export interface Price {
  date: Core.Date;
  commodity: string;
  price: Core.Amount;
}
