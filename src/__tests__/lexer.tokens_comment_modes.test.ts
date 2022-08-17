import test from 'ava';
import { Lexer } from 'chevrotain';
import _ from 'lodash';

import { BasicTokens, CommentModeTokens } from '../lib/lexer/tokens';

import * as utils from './utils';

const defaultModeTokensWithoutModes = [
  ..._.values(CommentModeTokens),
  ..._.values(BasicTokens)
];
defaultModeTokensWithoutModes.forEach((t) => {
  t.POP_MODE = false; // do not pop modes, causes errors as we will not be in a mode
  t.PUSH_MODE = undefined; // do not push modes
  delete t.GROUP;
});
const lex = new Lexer(defaultModeTokensWithoutModes, { skipValidations: true });

test('SEMICOLON_AT_START', (t) => {
  // Separators
  t.is(
    utils.simplifyLexResult(lex.tokenize(';')).map((t) => t.n)[0],
    'SEMICOLON_AT_START',
    'accepts ;'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize(':')).map((t) => t.n)[0],
    'SEMICOLON_AT_START',
    'does not accept colon'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('*')).map((t) => t.n)[0],
    'SEMICOLON_AT_START',
    'does not accept asterisk'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('#')).map((t) => t.n)[0],
    'SEMICOLON_AT_START',
    'does not accept hashtag'
  );

  // Start of line
  t.is(
    utils.simplifyLexResult(lex.tokenize(';')).map((t) => t.n)[0],
    'SEMICOLON_AT_START',
    'accepts SEMICOLON_AT_START at start of file'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('#\n;')).map((t) => t.n)[2],
    'SEMICOLON_AT_START',
    'accepts SEMICOLON_AT_START at start of line'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('=;')).map((t) => t.n)[1],
    'SEMICOLON_AT_START',
    'does not accept SEMICOLON_AT_START in middle of line'
  );
});

test('HASHTAG_AT_START', (t) => {
  // Separators
  t.is(
    utils.simplifyLexResult(lex.tokenize('#')).map((t) => t.n)[0],
    'HASHTAG_AT_START',
    'accepts #'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize(';')).map((t) => t.n)[0],
    'HASHTAG_AT_START',
    'does not accept semicolon'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('*')).map((t) => t.n)[0],
    'HASHTAG_AT_START',
    'does not accept asterisk'
  );

  // Start of line
  t.is(
    utils.simplifyLexResult(lex.tokenize('#')).map((t) => t.n)[0],
    'HASHTAG_AT_START',
    'accepts HASHTAG_AT_START at start of file'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize(';\n#')).map((t) => t.n)[2],
    'HASHTAG_AT_START',
    'accepts HASHTAG_AT_START at start of line'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('=#')).map((t) => t.n)[1],
    'HASHTAG_AT_START',
    'does not accept HASHTAG_AT_START in middle of line'
  );
});

test('ASTERISK_AT_START', (t) => {
  // Separators
  t.is(
    utils.simplifyLexResult(lex.tokenize('*')).map((t) => t.n)[0],
    'ASTERISK_AT_START',
    'accepts *'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize(';')).map((t) => t.n)[0],
    'ASTERISK_AT_START',
    'does not accept semicolon'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('#')).map((t) => t.n)[0],
    'ASTERISK_AT_START',
    'does not accept hashtag'
  );

  // Start of line
  t.is(
    utils.simplifyLexResult(lex.tokenize('*')).map((t) => t.n)[0],
    'ASTERISK_AT_START',
    'accepts ASTERISK_AT_START at start of file'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('#\n*')).map((t) => t.n)[2],
    'ASTERISK_AT_START',
    'accepts ASTERISK_AT_START at start of line'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('=*')).map((t) => t.n)[1],
    'ASTERISK_AT_START',
    'does not accept ASTERISK_AT_START in middle of line'
  );
});
