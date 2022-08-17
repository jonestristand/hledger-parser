import { createToken, Lexer } from 'chevrotain';

import {
  matchAccountName,
  matchCommodityText,
  matchOnlyAfter
} from './lexer_utils';
import BasicTokens from './tokens_basic';
import CommentModeTokens from './tokens_comment_modes';
import DefaultModeTokens from './tokens_default_mode';

// ====- Simple tokens -====
const MultipleWSPostingMode = createToken({
  name: 'MultipleWSPostingMode',
  pattern: /[ \t][ \t]+/,
  group: Lexer.SKIPPED,
  pop_mode: true,
  push_mode: 'posting_amount_mode'
});

// ====- Complex tokens -====
const RealAccountName = createToken({
  name: 'RealAccountName',
  pattern: matchAccountName(),
  line_breaks: false
});

const VirtualAccountName = createToken({
  name: 'VirtualAccountName',
  pattern: matchAccountName('('),
  line_breaks: false,
  start_chars_hint: ['(']
});

const VirtualBalancedAccountName = createToken({
  name: 'VirtualBalancedAccountName',
  pattern: matchAccountName('['),
  line_breaks: false,
  start_chars_hint: ['[']
});

const Number = createToken({
  name: 'Number',
  pattern: /[-+]?[\d,]+(\.\d+)?([Ee][+-]?\d+)?/
});

const CommodityText = createToken({
  name: 'CommodityText',
  pattern: matchCommodityText,
  line_breaks: false
});

const PostingStatusIndicator = createToken({
  name: 'PostingStatusIndicator',
  pattern: matchOnlyAfter(/[*!]/y, [DefaultModeTokens.INDENT]),
  start_chars_hint: ['!', '*'],
  line_breaks: false
});

// ====- Lexing modes -========================================================
export const posting_mode = [
  MultipleWSPostingMode,
  BasicTokens.SINGLE_WS,
  PostingStatusIndicator,
  CommentModeTokens.SemicolonComment,
  BasicTokens.NEWLINE,
  VirtualAccountName,
  VirtualBalancedAccountName,
  RealAccountName
];

export const posting_amount_mode = [
  CommentModeTokens.SemicolonComment,
  BasicTokens.SINGLE_WS,
  BasicTokens.AT,
  BasicTokens.LPAREN,
  BasicTokens.RPAREN,
  BasicTokens.EQUALS,
  BasicTokens.ASTERISK,
  Number,
  CommodityText,
  BasicTokens.DASH,
  BasicTokens.NEWLINE
];

// ====- Token export -========================================================
export default {
  MultipleWSPostingMode,
  RealAccountName,
  VirtualAccountName,
  VirtualBalancedAccountName,
  Number,
  CommodityText,
  PostingStatusIndicator
};
