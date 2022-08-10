import { createToken } from 'chevrotain';

import { matchOnlyAfter, matchParenValue } from './lexer_utils';
import BasicTokens from './tokens_basic';
import CommentModeTokens from './tokens_comment_modes';
import DefaultModeTokens from './tokens_default_mode';

// ====- Simple tokens -====
const TxnStatusIndicator = createToken({
  name: 'TxnStatusIndicator',
  pattern: matchOnlyAfter(/[*!]/y, [
    BasicTokens.Date,
    DefaultModeTokens.DateAtStart
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
  pattern: /[^;\r\n]+/ ///[a-zA-Z_][a-zA-Z _]*[a-zA-Z_]/
});

// ====- Lexing modes -========================================================
export const txn_line_mode = [
  BasicTokens.SINGLE_WS,
  BasicTokens.NEWLINE,
  BasicTokens.EQUALS,
  BasicTokens.Date,
  ParenValue,
  TxnStatusIndicator,
  CommentModeTokens.SemicolonComment,
  Text
];

// ====- Token export -========================================================
export default {
  TxnStatusIndicator,
  Text,
  ParenValue
};
