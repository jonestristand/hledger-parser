import { createToken, Lexer } from 'chevrotain';

const NEWLINE = createToken({
  name: 'NEWLINE',
  pattern: /(\r\n|\r|\n)/,
  pop_mode: true,
  push_mode: 'default_mode'
});

const SINGLE_WS = createToken({
  name: 'SINGLE_WS',
  pattern: /[ \t]/,
  group: Lexer.SKIPPED
});

const DIGIT = createToken({ name: 'DIGIT', pattern: /\d/ });
const SLASH = createToken({ name: 'SLASH', pattern: '/' });
const DOT = createToken({ name: 'DOT', pattern: '.' });
const COMMA = createToken({ name: 'COMMA', pattern: ',' });
const DASH = createToken({ name: 'DASH', pattern: '-' });
const COLON = createToken({ name: 'COLON', pattern: ':' });
const EXCLAMATION = createToken({ name: 'EXCLAMATION', pattern: '!' });
const EQUALS = createToken({ name: 'EQUALS', pattern: '=' });
const AT = createToken({ name: 'AT', pattern: '@' });
const PIPE = createToken({ name: 'PIPE', pattern: '|' });

const SEMICOLON = createToken({ name: 'SEMICOLON', pattern: /;/ });
const HASHTAG = createToken({ name: 'HASHTAG', pattern: /#/ });
const ASTERISK = createToken({ name: 'ASTERISK', pattern: /\*/ });

const LPAREN = createToken({ name: 'LBRACKET', pattern: '(' });
const RPAREN = createToken({ name: 'RBRACKET', pattern: ')' });

const LBRACKET = createToken({ name: 'LBRACKET', pattern: '[' });
const RBRACKET = createToken({ name: 'RBRACKET', pattern: ']' });

const Date = createToken({
  name: 'Date',
  pattern: /([0-9]{4}[-./])?[0-9]{1,2}[-./][0-9]{1,2}/y,
  line_breaks: false,
  start_chars_hint: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
});

export default {
  NEWLINE,
  SINGLE_WS,
  DIGIT,
  SLASH,
  DOT,
  COMMA,
  DASH,
  COLON,
  EXCLAMATION,
  EQUALS,
  AT,
  PIPE,
  SEMICOLON,
  HASHTAG,
  ASTERISK,
  LPAREN,
  RPAREN,
  LBRACKET,
  RBRACKET,
  Date
};
