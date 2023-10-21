import {
  AccountDirective,
  AMOUNT_WS,
  ASTERISK,
  ASTERISK_AT_START,
  AT,
  CommentText,
  CommodityText,
  DASH,
  DateAtStart,
  EQUALS,
  HASHTAG_AT_START,
  INDENT,
  InlineCommentTagColon,
  InlineCommentTagComma,
  InlineCommentTagName,
  InlineCommentTagValue,
  InlineCommentText,
  JournalDate,
  JournalNumber,
  LPAREN,
  MultipleWSPostingMode,
  NEWLINE,
  ParenValue,
  PDirective,
  PDirectiveCommodityText,
  PIPE,
  PLUS,
  PostingStatusIndicator,
  RealAccountName,
  RPAREN,
  SEMICOLON_AT_START,
  SemicolonComment,
  SINGLE_WS,
  Text,
  TxnStatusIndicator,
  VirtualAccountName,
  VirtualBalancedAccountName
} from './tokens';

export const default_mode = [
  DateAtStart,
  AccountDirective,
  PDirective,
  INDENT,
  SEMICOLON_AT_START,
  HASHTAG_AT_START,
  ASTERISK_AT_START,
  NEWLINE
];

// Note: Subdirectives must be listed before RealAccountName
export const indent_mode = [
  SemicolonComment,
  PostingStatusIndicator,
  VirtualAccountName,
  VirtualBalancedAccountName,
  RealAccountName
];

export const account_mode = [
  NEWLINE,
  SINGLE_WS,
  SemicolonComment,
  RealAccountName
];

export const comment_mode = [
  SINGLE_WS,
  CommentText,
  NEWLINE
];

export const inline_comment_mode = [
  SINGLE_WS,
  InlineCommentTagColon,
  InlineCommentTagName,
  InlineCommentText,
  NEWLINE
];

export const inline_comment_tag_mode = [
  SINGLE_WS,
  InlineCommentTagValue,
  InlineCommentTagComma,
  NEWLINE
];

export const posting_mode = [
  MultipleWSPostingMode,
  SINGLE_WS,
  PostingStatusIndicator,
  SemicolonComment,
  NEWLINE,
  VirtualAccountName,
  VirtualBalancedAccountName,
  RealAccountName
];

export const posting_amount_mode = [
  SemicolonComment,
  AT,
  LPAREN,
  RPAREN,
  EQUALS,
  ASTERISK,
  JournalNumber,
  AMOUNT_WS,
  CommodityText,
  DASH,
  PLUS,
  NEWLINE
];

export const txn_line_mode = [
  SINGLE_WS,
  NEWLINE,
  EQUALS,
  JournalDate,
  PIPE,
  ParenValue,
  TxnStatusIndicator,
  SemicolonComment,
  Text
];

export const price_mode = [
  SINGLE_WS,
  JournalDate,
  PDirectiveCommodityText
];

export const price_amounts_mode = [
  AMOUNT_WS,
  NEWLINE,
  JournalNumber,
  CommodityText,
  DASH,
  PLUS
];
