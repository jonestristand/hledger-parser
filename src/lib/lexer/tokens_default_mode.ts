import { createToken } from 'chevrotain';

import { matchOnlyAtStart } from './lexer_utils';
import BasicTokens from './tokens_basic';
import CommentModeTokens from './tokens_comment_modes';

// ====- Mode indicating tokens -====
const DateAtStart = createToken({
  name: 'DateAtStart',
  pattern: matchOnlyAtStart(/([0-9]{4}[-./])?[0-9]{1,2}[-./][0-9]{1,2}/y),
  line_breaks: false,
  start_chars_hint: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  push_mode: 'txn_line_mode'
});

const INDENT = createToken({
  name: 'INDENT',
  pattern: matchOnlyAtStart(/  +|\t+/y),
  start_chars_hint: [' ', '\t'],
  line_breaks: false,
  push_mode: 'posting_mode'
});

const PDirective = createToken({
  name: 'PDirective',
  pattern: matchOnlyAtStart(/P/y),
  start_chars_hint: ['P'],
  line_breaks: false,
  push_mode: 'price_mode'
});

const AccountDirective = createToken({
  name: 'AccountDirective',
  pattern: matchOnlyAtStart(/account/y),
  start_chars_hint: ['A', 'a'],
  line_breaks: false,
  push_mode: 'account_mode'
});

// ====- Lexing modes -========================================================
export const default_mode = [
  INDENT,
  DateAtStart,
  PDirective,
  AccountDirective,
  CommentModeTokens.SEMICOLON_AT_START,
  CommentModeTokens.HASHTAG_AT_START,
  CommentModeTokens.ASTERISK_AT_START,
  BasicTokens.NEWLINE
];

// ====- Token Export -========================================================
export default {
  INDENT,
  PDirective,
  AccountDirective,
  DateAtStart
};
