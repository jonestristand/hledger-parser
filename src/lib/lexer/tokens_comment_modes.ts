import { createToken } from 'chevrotain';

import { matchOnlyAtStart } from './lexer_utils';
import BasicTokens from './tokens_basic';

// ====- Simple tokens -====
const SemicolonComment = createToken({
  name: 'SemicolonComment',
  pattern: /;/,
  line_breaks: false,
  start_chars_hint: [';'],
  push_mode: 'inline_comment_mode'
});
const SEMICOLON_AT_START = createToken({
  name: 'SEMICOLON_AT_START',
  pattern: matchOnlyAtStart(/;/y),
  line_breaks: false,
  start_chars_hint: [';'],
  push_mode: 'comment_mode'
});

const HASHTAG_AT_START = createToken({
  name: 'HASHTAG_AT_START',
  pattern: matchOnlyAtStart(/#/y),
  line_breaks: false,
  start_chars_hint: ['#'],
  push_mode: 'comment_mode'
});

const ASTERISK_AT_START = createToken({
  name: 'ASTERISK_AT_START',
  pattern: matchOnlyAtStart(/\*/y),
  line_breaks: false,
  start_chars_hint: ['*'],
  push_mode: 'comment_mode'
});

// ====- Complex tokens -====
const CommentText = createToken({
  name: 'CommentText',
  pattern: /[^\r\n]+/
});

const InlineCommentText = createToken({
  name: 'InlineCommentText',
  pattern: /[^\r\n]+?(?=[\w-]+:|[\r\n])/
});

const InlineCommentTagName = createToken({
  name: 'InlineCommentTagName',
  pattern: /[a-zA-Z0-9_-]+(?=:)/,
  line_breaks: false
});

const InlineCommentTagColon = createToken({
  name: 'InlineCommentTagColon',
  pattern: ':',
  push_mode: 'inline_comment_tag_mode'
});

const InlineCommentTagValue = createToken({
  name: 'InlineCommentTagValue',
  pattern: /[^\r\n,]+/
});

const InlineCommentTagComma = createToken({
  name: 'InlineCommentTagComma',
  pattern: ',',
  pop_mode: true
});

// ====- Lexing modes -========================================================
export const comment_mode = [
  BasicTokens.SINGLE_WS,
  CommentText,
  BasicTokens.NEWLINE
];

export const inline_comment_mode = [
  BasicTokens.SINGLE_WS,
  InlineCommentTagColon,
  InlineCommentTagName,
  InlineCommentText,
  BasicTokens.NEWLINE
];

export const inline_comment_tag_mode = [
  BasicTokens.SINGLE_WS,
  InlineCommentTagValue,
  InlineCommentTagComma,
  BasicTokens.NEWLINE
];

// ====- Token Export -========================================================
export default {
  SEMICOLON_AT_START,
  SemicolonComment,
  HASHTAG_AT_START,
  ASTERISK_AT_START,
  CommentText,
  InlineCommentText,
  InlineCommentTagName,
  InlineCommentTagColon,
  InlineCommentTagValue,
  InlineCommentTagComma
};
