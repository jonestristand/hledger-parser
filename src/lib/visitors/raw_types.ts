import { CommodityAmount } from '../types';
import * as Core from '../types';

/**
 * Type for a 'raw' [hledger journal](https://hledger.org/1.26/hledger.html#journal-format), an array of {@link JournalItem}s in order
 * of appearance in the journal source code
 */
export type Journal = JournalItem[];

/**
 * Type for a journal item, can be a comment, transaction, or one of many types of
 * directives.
 */
export type JournalItem =
  | Transaction
  | Comment
  | PriceDirective
  | AccountDirective
  | CommodityDirective
  | DefaultCommodityDirective;

/**
 * Type for a 'raw' [hledger transaction](https://hledger.org/1.26/hledger.html#transactions)
 */
export interface Transaction {
  type: 'transaction';
  value: {
    date: string;
    postingDate?: string;
    status: Core.StatusIndicator;
    chequeNumber?: string;
    description: Core.TxnDescription;
    comment?: InlineComment;
    contentLines: TransactionItem[];
  };
}

/**
 * Type for the initialization line of a [hledger transaction](https://hledger.org/1.26/hledger.html#transactions)
 */
export interface TransactionInitLine {
  date: string;
  postingDate?: string;
  description: Core.TxnDescription;
  status: Core.StatusIndicator;
  chequeNumber?: string;
  comment?: InlineComment;
}

/**
 * Type for a 'raw' transaction date, composed of a [simple date](https://hledger.org/1.26/hledger.html#simple-dates) and an
 * optional [posting date](https://hledger.org/1.26/hledger.html#secondary-dates)
 */
export interface TransactionDate {
  date: string;
  postingDate?: string;
}

/**
 * Type for a 'raw' transaction item, which can be either a [posting](https://hledger.org/1.26/hledger.html#postings) or a [comment](https://hledger.org/1.26/hledger.html#comments)
 */
export type TransactionItem = Posting | InlineComment;

/**
 * Type for a 'raw' transaction [posting](https://hledger.org/1.26/hledger.html#postings)
 */
export interface Posting {
  type: 'posting';
  value: Core.Posting & { comment?: InlineComment };
}

/**
 * Type for a [full-line comment](https://hledger.org/1.26/hledger.html#comments)
 */
export interface Comment {
  type: 'comment';
  value: string;
}

/**
 * Type for an [inline comment](https://hledger.org/1.26/hledger.html#comments)
 */
export interface InlineComment {
  type: 'inlineComment';
  value: InlineCommentItem[];
}

/**
 * Type for an item in an inline comment, either a text element or a
 * [tag](https://hledger.org/1.26/hledger.html#tags-1)
 */
export type InlineCommentItem = string | Tag;

/**
 * Type for a 'raw' comment [tag](https://hledger.org/1.26/hledger.html#tags-1)
 */
export interface Tag {
  type: 'tag';
  value: Core.Tag;
}

/**
 * Type for a 'raw' [price directive](https://hledger.org/1.26/hledger.html#declaring-market-prices)
 */
export interface PriceDirective {
  type: 'priceDirective';
  value: {
    date: string;
    commodity: string;
    price: Core.Amount;
  };
}

/**
 * Type for a 'raw' [account directive](https://hledger.org/1.26/hledger.html#account-comments)
 */
export interface AccountDirective {
  type: 'accountDirective';
  value: {
    account: string[];
    comments?: InlineComment;
    contentLines: AccountDirectiveContentLine[];
  };
}

/**
 * Type for an [account directive](https://hledger.org/1.26/hledger.html#account-comments) line,
 * can be an inline comment or (in future) a ledger-type subdirective.
 */
export type AccountDirectiveContentLine = InlineComment;

/**
 * Type for a 'raw' [commodity directive](https://hledger.org/1.31/hledger.html#commodity-directive)
 */
export interface CommodityDirective {
  type: 'commodityDirective';
  value: {
    commodity?: string;
    format?: CommodityAmount;
    comments?: InlineComment;
    contentLines: CommodityDirectiveContentLine[];
  };
}

/**
 * Type for a 'raw' [format sudbdirective](https://hledger.org/1.31/hledger.html#commodity-directive)
 */
export interface FormatSubdirective {
  type: 'formatSubdirective';
  value: {
    format: Core.CommodityAmount;
  }
}

/**
 * Type for a 'raw' [default commodity directive](https://hledger.org/1.31/hledger.html#d-directive)
 */
export interface DefaultCommodityDirective {
  type: 'defaultCommodityDirective';
  value: {
    format: CommodityAmount;
    comments?: InlineComment;
    contentLines: DefaultCommodityDirectiveContentLine[];
  };
}

export interface CommodityDirectiveContentLine {
  type: 'commodityDirectiveContentLine';
  value: {
    formatSubdirective?: FormatSubdirective;
    inlineComment?: InlineComment;
  }
}

export interface DefaultCommodityDirectiveContentLine {
  type: 'defaultCommodityDirectiveContentLine';
  value: {
    inlineComment: InlineComment;
  }
}
