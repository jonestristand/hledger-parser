import {
  AccountDirective,
  ASTERISK,
  ASTERISK_AT_START,
  AT,
  CommentText,
  CommodityDirective,
  CommodityText,
  DASH,
  JournalDate,
  DateAtStart,
  EQUALS,
  FormatSubDirective,
  HASHTAG_AT_START,
  INDENT,
  InlineCommentTagColon,
  InlineCommentTagComma,
  InlineCommentTagName,
  InlineCommentTagValue,
  InlineCommentText,
  LPAREN,
  MultipleWSPostingMode,
  NEWLINE,
  JournalNumber,
  ParenValue,
  PDirective,
  PDirectiveDate,
  PIPE,
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
  CommodityDirective,
  INDENT,
  SEMICOLON_AT_START,
  HASHTAG_AT_START,
  ASTERISK_AT_START,
  NEWLINE
];

export const indent_mode = [
  RealAccountName,
  VirtualAccountName,
  VirtualBalancedAccountName,
  PostingStatusIndicator,
  FormatSubDirective,
  SemicolonComment
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
  SINGLE_WS,
  AT,
  LPAREN,
  RPAREN,
  EQUALS,
  ASTERISK,
  JournalNumber,
  CommodityText,
  DASH,
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
  NEWLINE,
  PDirectiveDate,
  DASH
];

export const price_amounts_mode = [
  SINGLE_WS,
  NEWLINE,
  JournalNumber,
  CommodityText,
  DASH
];

export const commodity_mode = [
  SINGLE_WS,
  CommodityText,
  JournalNumber,
  SemicolonComment,
  NEWLINE
];

export const commodity_format_mode = [
  SINGLE_WS,
  CommodityText,
  JournalNumber,
  SemicolonComment,
  NEWLINE
];

