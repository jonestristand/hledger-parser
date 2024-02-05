import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface LineCommentCstNode extends CstNode {
  name: "lineComment";
  children: LineCommentCstChildren;
}

export type LineCommentCstChildren = {
  SEMICOLON_AT_START?: IToken[];
  HASHTAG_AT_START?: IToken[];
  ASTERISK_AT_START?: IToken[];
  CommentText?: IToken[];
  NEWLINE: IToken[];
};

export interface InlineCommentCstNode extends CstNode {
  name: "inlineComment";
  children: InlineCommentCstChildren;
}

export type InlineCommentCstChildren = {
  SemicolonComment: IToken[];
  inlineCommentItem?: InlineCommentItemCstNode[];
};

export interface InlineCommentItemCstNode extends CstNode {
  name: "inlineCommentItem";
  children: InlineCommentItemCstChildren;
}

export type InlineCommentItemCstChildren = {
  InlineCommentText?: IToken[];
  tag?: TagCstNode[];
};

export interface TagCstNode extends CstNode {
  name: "tag";
  children: TagCstChildren;
}

export type TagCstChildren = {
  InlineCommentTagName: IToken[];
  InlineCommentTagColon: IToken[];
  InlineCommentTagValue?: IToken[];
  InlineCommentTagComma?: IToken[];
};

export interface JournalCstNode extends CstNode {
  name: "journal";
  children: JournalCstChildren;
}

export type JournalCstChildren = {
  journalItem?: JournalItemCstNode[];
};

export interface JournalItemCstNode extends CstNode {
  name: "journalItem";
  children: JournalItemCstChildren;
}

export type JournalItemCstChildren = {
  transaction?: TransactionCstNode[];
  lineComment?: LineCommentCstNode[];
  priceDirective?: PriceDirectiveCstNode[];
  accountDirective?: AccountDirectiveCstNode[];
  NEWLINE?: IToken[];
};

export interface TransactionCstNode extends CstNode {
  name: "transaction";
  children: TransactionCstChildren;
}

export type TransactionCstChildren = {
  transactionInitLine: TransactionInitLineCstNode[];
  transactionContentLine?: TransactionContentLineCstNode[];
};

export interface PriceDirectiveCstNode extends CstNode {
  name: "priceDirective";
  children: PriceDirectiveCstChildren;
}

export type PriceDirectiveCstChildren = {
  PDirective: IToken[];
  Date: IToken[];
  PDirectiveCommodityText: IToken[];
  amount: AmountCstNode[];
  NEWLINE: IToken[];
};

export interface AccountDirectiveCstNode extends CstNode {
  name: "accountDirective";
  children: AccountDirectiveCstChildren;
}

export type AccountDirectiveCstChildren = {
  AccountDirective: IToken[];
  RealAccountName: IToken[];
  inlineComment?: InlineCommentCstNode[];
  NEWLINE: IToken[];
  accountDirectiveContentLine?: AccountDirectiveContentLineCstNode[];
};

export interface AccountDirectiveContentLineCstNode extends CstNode {
  name: "accountDirectiveContentLine";
  children: AccountDirectiveContentLineCstChildren;
}

export type AccountDirectiveContentLineCstChildren = {
  INDENT: IToken[];
  inlineComment: InlineCommentCstNode[];
  NEWLINE: IToken[];
};

export interface TransactionInitLineCstNode extends CstNode {
  name: "transactionInitLine";
  children: TransactionInitLineCstChildren;
}

export type TransactionInitLineCstChildren = {
  transactionDate: TransactionDateCstNode[];
  statusIndicator?: StatusIndicatorCstNode[];
  chequeNumber?: ChequeNumberCstNode[];
  description?: DescriptionCstNode[];
  inlineComment?: InlineCommentCstNode[];
  NEWLINE: IToken[];
};

export interface TransactionContentLineCstNode extends CstNode {
  name: "transactionContentLine";
  children: TransactionContentLineCstChildren;
}

export type TransactionContentLineCstChildren = {
  INDENT: IToken[];
  posting?: PostingCstNode[];
  inlineComment?: InlineCommentCstNode[];
  NEWLINE: IToken[];
};

export interface PostingCstNode extends CstNode {
  name: "posting";
  children: PostingCstChildren;
}

export type PostingCstChildren = {
  statusIndicator?: StatusIndicatorCstNode[];
  account: AccountCstNode[];
  amount?: AmountCstNode[];
  lotPrice?: LotPriceCstNode[];
  assertion?: AssertionCstNode[];
  inlineComment?: InlineCommentCstNode[];
};

export interface TransactionDateCstNode extends CstNode {
  name: "transactionDate";
  children: TransactionDateCstChildren;
}

export type TransactionDateCstChildren = {
  DateAtStart: IToken[];
  EQUALS?: IToken[];
  Date?: IToken[];
};

export interface AccountCstNode extends CstNode {
  name: "account";
  children: AccountCstChildren;
}

export type AccountCstChildren = {
  RealAccountName?: IToken[];
  VirtualAccountName?: IToken[];
  VirtualBalancedAccountName?: IToken[];
};

export interface AmountCstNode extends CstNode {
  name: "amount";
  children: AmountCstChildren;
}

export type AmountCstChildren = {
  DASH?: (IToken)[];
  PLUS?: (IToken)[];
  AMOUNT_WS?: (IToken)[];
  CommodityText?: (IToken)[];
  Number?: (IToken)[];
};

export interface LotPriceCstNode extends CstNode {
  name: "lotPrice";
  children: LotPriceCstChildren;
}

export type LotPriceCstChildren = {
  LPAREN?: IToken[];
  AT?: (IToken)[];
  RPAREN?: IToken[];
  AMOUNT_WS: IToken[];
  amount: AmountCstNode[];
};

export interface AssertionCstNode extends CstNode {
  name: "assertion";
  children: AssertionCstChildren;
}

export type AssertionCstChildren = {
  EQUALS: (IToken)[];
  ASTERISK?: IToken[];
  AMOUNT_WS: IToken[];
  amount: AmountCstNode[];
};

export interface StatusIndicatorCstNode extends CstNode {
  name: "statusIndicator";
  children: StatusIndicatorCstChildren;
}

export type StatusIndicatorCstChildren = {
  PostingStatusIndicator?: IToken[];
  TxnStatusIndicator?: IToken[];
};

export interface ChequeNumberCstNode extends CstNode {
  name: "chequeNumber";
  children: ChequeNumberCstChildren;
}

export type ChequeNumberCstChildren = {
  ParenValue: IToken[];
};

export interface DescriptionCstNode extends CstNode {
  name: "description";
  children: DescriptionCstChildren;
}

export type DescriptionCstChildren = {
  Text: IToken[];
  PIPE?: IToken[];
  Memo?: IToken[];
};

export interface CommodityDirectiveCstNode extends CstNode {
  name: "commodityDirective";
  children: CommodityDirectiveCstChildren;
}

export type CommodityDirectiveCstChildren = {
  CommodityDirective: IToken[];
  commodityAmount?: CommodityAmountCstNode[];
  inlineComment?: (InlineCommentCstNode)[];
  CommodityText?: IToken[];
  AMOUNT_WS?: IToken[];
  NEWLINE: IToken[];
  commodityDirectiveContentLine?: CommodityDirectiveContentLineCstNode[];
};

export interface CommodityAmountCstNode extends CstNode {
  name: "commodityAmount";
  children: CommodityAmountCstChildren;
}

export type CommodityAmountCstChildren = {
  DASH?: (IToken)[];
  PLUS?: (IToken)[];
  AMOUNT_WS?: (IToken)[];
  CommodityText?: (IToken)[];
  Number?: (IToken)[];
};

export interface CommodityDirectiveContentLineCstNode extends CstNode {
  name: "commodityDirectiveContentLine";
  children: CommodityDirectiveContentLineCstChildren;
}

export type CommodityDirectiveContentLineCstChildren = {
  INDENT: IToken[];
  inlineComment?: (InlineCommentCstNode)[];
  NEWLINE?: (IToken)[];
  formatSubdirective?: FormatSubdirectiveCstNode[];
};

export interface FormatSubdirectiveCstNode extends CstNode {
  name: "formatSubdirective";
  children: FormatSubdirectiveCstChildren;
}

export type FormatSubdirectiveCstChildren = {
  FormatSubdirective: IToken[];
  commodityAmount: CommodityAmountCstNode[];
};

export interface DefaultCommodityDirectiveCstNode extends CstNode {
  name: "defaultCommodityDirective";
  children: DefaultCommodityDirectiveCstChildren;
}

export type DefaultCommodityDirectiveCstChildren = {
  DefaultCommodityDirective: IToken[];
  commodityAmount: CommodityAmountCstNode[];
  inlineComment?: InlineCommentCstNode[];
  NEWLINE: IToken[];
  defaultCommodityDirectiveContentLine?: DefaultCommodityDirectiveContentLineCstNode[];
};

export interface DefaultCommodityDirectiveContentLineCstNode extends CstNode {
  name: "defaultCommodityDirectiveContentLine";
  children: DefaultCommodityDirectiveContentLineCstChildren;
}

export type DefaultCommodityDirectiveContentLineCstChildren = {
  INDENT: IToken[];
  inlineComment: InlineCommentCstNode[];
  NEWLINE: IToken[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  lineComment(children: LineCommentCstChildren, param?: IN): OUT;
  inlineComment(children: InlineCommentCstChildren, param?: IN): OUT;
  inlineCommentItem(children: InlineCommentItemCstChildren, param?: IN): OUT;
  tag(children: TagCstChildren, param?: IN): OUT;
  journal(children: JournalCstChildren, param?: IN): OUT;
  journalItem(children: JournalItemCstChildren, param?: IN): OUT;
  transaction(children: TransactionCstChildren, param?: IN): OUT;
  priceDirective(children: PriceDirectiveCstChildren, param?: IN): OUT;
  accountDirective(children: AccountDirectiveCstChildren, param?: IN): OUT;
  accountDirectiveContentLine(children: AccountDirectiveContentLineCstChildren, param?: IN): OUT;
  transactionInitLine(children: TransactionInitLineCstChildren, param?: IN): OUT;
  transactionContentLine(children: TransactionContentLineCstChildren, param?: IN): OUT;
  posting(children: PostingCstChildren, param?: IN): OUT;
  transactionDate(children: TransactionDateCstChildren, param?: IN): OUT;
  account(children: AccountCstChildren, param?: IN): OUT;
  amount(children: AmountCstChildren, param?: IN): OUT;
  lotPrice(children: LotPriceCstChildren, param?: IN): OUT;
  assertion(children: AssertionCstChildren, param?: IN): OUT;
  statusIndicator(children: StatusIndicatorCstChildren, param?: IN): OUT;
  chequeNumber(children: ChequeNumberCstChildren, param?: IN): OUT;
  description(children: DescriptionCstChildren, param?: IN): OUT;
  commodityDirective(children: CommodityDirectiveCstChildren, param?: IN): OUT;
  commodityAmount(children: CommodityAmountCstChildren, param?: IN): OUT;
  commodityDirectiveContentLine(children: CommodityDirectiveContentLineCstChildren, param?: IN): OUT;
  formatSubdirective(children: FormatSubdirectiveCstChildren, param?: IN): OUT;
  defaultCommodityDirective(children: DefaultCommodityDirectiveCstChildren, param?: IN): OUT;
  defaultCommodityDirectiveContentLine(children: DefaultCommodityDirectiveContentLineCstChildren, param?: IN): OUT;
}
