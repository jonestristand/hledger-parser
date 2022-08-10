import * as Core from '../types';

//import * as ParserTypes from '../hledger_cst';

export type Journal = JournalItem[];

export type JournalItem =
  | Transaction
  | Comment
  | PriceDirective
  | AccountDirective;

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

export interface TransactionInitLine {
  date: string;
  postingDate?: string;
  description: Core.TxnDescription;
  status: Core.StatusIndicator;
  chequeNumber?: string;
  comment?: InlineComment;
}

export interface TransactionDate {
  date: string;
  postingDate?: string;
}

export type TransactionItem = Posting | InlineComment;

export interface Posting {
  type: 'posting';
  value: Core.Posting & { comment?: InlineComment };
}

export interface Comment {
  type: 'comment';
  value: string;
}

export interface InlineComment {
  type: 'inlineComment';
  value: InlineCommentItem[];
}

export type InlineCommentItem = string | Tag;

export interface Tag {
  type: 'tag';
  value: Core.Tag;
}

export interface PriceDirective {
  type: 'priceDirective';
  value: {
    date: string;
    commodity: string;
    price: Core.Amount;
  };
}

export interface AccountDirective {
  type: 'accountDirective';
  value: {
    account: string[];
    comments?: InlineComment;
    contentLines: AccountDirectiveContentLine[];
  };
}

export type AccountDirectiveContentLine = InlineComment;

/*
export type AllCstNodes =
  | ParserTypes.JournalCstNode
  | ParserTypes.JournalItemCstNode
  | ParserTypes.LineCommentCstNode
  | ParserTypes.InlineCommentCstNode
  | ParserTypes.InlineCommentItemCstNode
  | ParserTypes.TagCstNode
  | ParserTypes.TransactionCstNode
  | ParserTypes.PriceDirectiveCstNode
  | ParserTypes.AccountDirectiveCstNode
  | ParserTypes.AccountDirectiveContentLineCstNode
  | ParserTypes.TransactionInitLineCstNode
  | ParserTypes.TransactionContentLineCstNode
  | ParserTypes.PostingCstNode
  | ParserTypes.TransactionDateCstNode
  | ParserTypes.AccountCstNode
  | ParserTypes.AmountCstNode
  | ParserTypes.LotPriceCstNode
  | ParserTypes.AssertionCstNode
  | ParserTypes.StatusIndicatorCstNode
  | ParserTypes.ChequeNumberCstNode
  | ParserTypes.DescriptionCstNode;
  */
