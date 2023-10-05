import { createToken, Lexer } from 'chevrotain';

import {
  matchAccountName,
  matchCommodityText,
  matchJournalNumber,
  matchOnlyAfter,
  matchOnlyAtStart,
  matchParenValue,
  matchPriceCommodityText,
  NewlineName
} from './lexer_utils';

// ====- Basic Tokens -====

export const NEWLINE = createToken({
  name: NewlineName,
  pattern: /(\r\n|\r|\n)/,
  pop_mode: true,
  push_mode: 'default_mode'
});

export const INDENT = createToken({
  name: 'INDENT',
  pattern: matchOnlyAtStart(/  +|\t+/y),
  start_chars_hint: [' ', '\t'],
  line_breaks: false,
  push_mode: 'indent_mode'
});

export const SINGLE_WS = createToken({
  name: 'SINGLE_WS',
  pattern: /[ \t]/,
  group: Lexer.SKIPPED
});

export const DIGIT = createToken({ name: 'DIGIT', pattern: /\d/ });
export const SLASH = createToken({ name: 'SLASH', pattern: '/' });
export const DOT = createToken({ name: 'DOT', pattern: '.' });
export const COMMA = createToken({ name: 'COMMA', pattern: ',' });
export const DASH = createToken({ name: 'DASH', pattern: '-' });
export const PLUS = createToken({ name: 'PLUS', pattern: '+' });
export const COLON = createToken({ name: 'COLON', pattern: ':' });
export const EXCLAMATION = createToken({ name: 'EXCLAMATION', pattern: '!' });
export const EQUALS = createToken({ name: 'EQUALS', pattern: '=' });
export const AT = createToken({ name: 'AT', pattern: '@' });
export const PIPE = createToken({ name: 'PIPE', pattern: '|' });

export const SEMICOLON = createToken({ name: 'SEMICOLON', pattern: /;/ });
export const HASHTAG = createToken({ name: 'HASHTAG', pattern: /#/ });
export const ASTERISK = createToken({ name: 'ASTERISK', pattern: /\*/ });

export const LPAREN = createToken({ name: 'LPAREN', pattern: '(' });
export const RPAREN = createToken({ name: 'RPAREN', pattern: ')' });

export const LBRACKET = createToken({ name: 'LBRACKET', pattern: '[' });
export const RBRACKET = createToken({ name: 'RBRACKET', pattern: ']' });

export const JournalDate = createToken({
  name: 'Date',
  pattern: /([0-9]{4}[-./])?[0-9]{1,2}[-./][0-9]{1,2}/y,
  line_breaks: false,
  start_chars_hint: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
});

// ====- Comment Tokens -====

export const SemicolonComment = createToken({
  name: 'SemicolonComment',
  pattern: /;/,
  line_breaks: false,
  start_chars_hint: [';'],
  push_mode: 'inline_comment_mode'
});

export const SEMICOLON_AT_START = createToken({
  name: 'SEMICOLON_AT_START',
  pattern: matchOnlyAtStart(/;/y),
  line_breaks: false,
  start_chars_hint: [';'],
  push_mode: 'comment_mode'
});

export const HASHTAG_AT_START = createToken({
  name: 'HASHTAG_AT_START',
  pattern: matchOnlyAtStart(/#/y),
  line_breaks: false,
  start_chars_hint: ['#'],
  push_mode: 'comment_mode'
});

export const ASTERISK_AT_START = createToken({
  name: 'ASTERISK_AT_START',
  pattern: matchOnlyAtStart(/\*/y),
  line_breaks: false,
  start_chars_hint: ['*'],
  push_mode: 'comment_mode'
});

export const CommentText = createToken({
  name: 'CommentText',
  pattern: /[^\r\n]+/
});

export const InlineCommentText = createToken({
  name: 'InlineCommentText',
  pattern: /[^\r\n]+?(?=[\w-]+:|[\r\n])/
});

export const InlineCommentTagName = createToken({
  name: 'InlineCommentTagName',
  pattern: /[a-zA-Z0-9_-]+(?=:)/,
  line_breaks: false
});

export const InlineCommentTagColon = createToken({
  name: 'InlineCommentTagColon',
  pattern: ':',
  push_mode: 'inline_comment_tag_mode'
});

export const InlineCommentTagValue = createToken({
  name: 'InlineCommentTagValue',
  pattern: /[^\r\n,]+/
});

export const InlineCommentTagComma = createToken({
  name: 'InlineCommentTagComma',
  pattern: ',',
  pop_mode: true
});

// ====- Account Directive Tokens -====

export const AccountDirective = createToken({
  name: 'AccountDirective',
  pattern: matchOnlyAtStart(/account/y),
  start_chars_hint: ['A', 'a'],
  line_breaks: false,
  push_mode: 'account_mode'
});

// ====- Posting Tokens -====

export const MultipleWSPostingMode = createToken({
  name: 'MultipleWSPostingMode',
  pattern: /[ \t][ \t]+/,
  group: Lexer.SKIPPED,
  pop_mode: true,
  push_mode: 'posting_amount_mode',
});

export const RealAccountName = createToken({
  name: 'RealAccountName',
  pattern: matchAccountName(),
  line_breaks: false,
  push_mode: 'posting_mode'
});

export const VirtualAccountName = createToken({
  name: 'VirtualAccountName',
  pattern: matchAccountName('('),
  line_breaks: false,
  start_chars_hint: ['('],
  push_mode: 'posting_mode'
});

export const VirtualBalancedAccountName = createToken({
  name: 'VirtualBalancedAccountName',
  pattern: matchAccountName('['),
  line_breaks: false,
  start_chars_hint: ['['],
  push_mode: 'posting_mode'
});

export const JournalNumber = createToken({
  name: 'Number',
  pattern: matchJournalNumber,
  start_chars_hint: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  line_breaks: false
});

export const CommodityText = createToken({
  name: 'CommodityText',
  pattern: matchCommodityText,
  line_breaks: false
});

export const AMOUNT_WS = createToken({ name: 'AMOUNT_WS', pattern: / +/ });

export const PostingStatusIndicator = createToken({
  name: 'PostingStatusIndicator',
  pattern: matchOnlyAfter(/[*!]/y, [INDENT]),
  start_chars_hint: ['!', '*'],
  line_breaks: false,
  push_mode: 'posting_mode'
});

// ====- Transaction Line Tokens -====

export const DateAtStart = createToken({
  name: 'DateAtStart',
  pattern: matchOnlyAtStart(/([0-9]{4}[-./])?[0-9]{1,2}[-./][0-9]{1,2}/y),
  line_breaks: false,
  start_chars_hint: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  push_mode: 'txn_line_mode'
});

export const TxnStatusIndicator = createToken({
  name: 'TxnStatusIndicator',
  pattern: matchOnlyAfter(/[*!]/y, [
    JournalDate,
    DateAtStart
  ]),
  start_chars_hint: ['!', '*'],
  line_breaks: false
});

export const ParenValue = createToken({
  name: 'ParenValue',
  pattern: matchParenValue,
  line_breaks: false,
  start_chars_hint: ['(']
});

export const Text = createToken({
  name: 'Text',
  pattern: /[^|;\r\n]+/ ///[a-zA-Z_][a-zA-Z _]*[a-zA-Z_]/
});

// ====- Price Directive Tokens -====

export const PDirective = createToken({
  name: 'PDirective',
  pattern: matchOnlyAtStart(/P/y),
  start_chars_hint: ['P'],
  line_breaks: false,
  push_mode: 'price_mode'
});

export const PDirectiveCommodityText = createToken({
  name: 'PDirectiveCommodityText',
  pattern: matchPriceCommodityText,
  line_breaks: false,
  push_mode: 'price_amounts_mode'
});
