import test from 'ava';
import { Lexer } from 'chevrotain';
import _ from 'lodash';

import { BasicTokens } from '../lib/lexer/tokens';

import * as utils from './utils';

const basicTokensWithoutModes = _.values(BasicTokens);
basicTokensWithoutModes.forEach((t) => {
  t.POP_MODE = false; // do not pop modes, causes errors as we will not be in a mode
  t.PUSH_MODE = undefined; // do not push modes
  delete t.GROUP;
});
const lex = new Lexer(basicTokensWithoutModes, { skipValidations: true });

// TODO: Need to solve issue of newline popping with no previous mode pushed causing an error
test('NEWLINE', (t) => {
  // Allowed
  t.is(
    utils.simplifyLexResult(lex.tokenize('\n'))[0],
    'NEWLINE',
    '\\n accepted'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('\r'))[0],
    'NEWLINE',
    '\\r accepted'
  );
  const crlfResult = utils.simplifyLexResult(lex.tokenize('\r\n'));
  t.is(crlfResult[0], 'NEWLINE', '\\r\\n accepted');
  t.is(crlfResult.length, 1, '\\r\\n reads as one NEWLINE, not two');
});

test('SINGLE_WS', (t) => {
  // Allowed and skipped
  t.is(
    utils.simplifyLexResult(lex.tokenize(' '))[0],
    'SINGLE_WS',
    'accept single space, skip'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('\t'))[0],
    'SINGLE_WS',
    'accept single tab, skip'
  );

  // Not allowed
  t.not(
    utils.simplifyLexResult(lex.tokenize('\n'))[0],
    'SINGLE_WS',
    'do not accept \\n'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('\r'))[0],
    'SINGLE_WS',
    'do not accept \\r'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('\r\n'))[0],
    'SINGLE_WS',
    'do not accept \\r\\n'
  );
});

test('DIGIT', (t) => {
  // Allowed
  t.is(
    utils.simplifyLexResult(lex.tokenize('1234567890')).length,
    10,
    'accepts any single digit'
  );

  // Not allowed
  t.not(
    utils.simplifyLexResult(lex.tokenize('a'))[0],
    'DIGIT',
    'does not accept letters'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('.'))[0],
    'DIGIT',
    'does not accept dot'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize(','))[0],
    'DIGIT',
    'does not accept comma'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('_'))[0],
    'DIGIT',
    'does not accept underscore'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize(' '))[0],
    'DIGIT',
    'does not accept space'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('$'))[0],
    'DIGIT',
    'does not accept currency symbol'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('#'))[0],
    'DIGIT',
    'does not accept hashtag'
  );
});

test('LPAREN', (t) => {
  // Allowed
  t.is(
    utils.simplifyLexResult(lex.tokenize('('))[0],
    'LPAREN',
    'accepts opening parentheses'
  );

  // Not allowed
  t.not(
    utils.simplifyLexResult(lex.tokenize('['))[0],
    'LPAREN',
    'does not accept opening bracket'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('{'))[0],
    'LPAREN',
    'does not accept opening brace'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize(')'))[0],
    'LPAREN',
    'does not accept closing parentheses'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize(']'))[0],
    'LPAREN',
    'does not accept closing bracket'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('}'))[0],
    'LPAREN',
    'does not accept closing brace'
  );
});

test('RPAREN', (t) => {
  // Allowed
  t.is(
    utils.simplifyLexResult(lex.tokenize(')'))[0],
    'RPAREN',
    'accepts closing parentheses'
  );

  // Not allowed
  t.not(
    utils.simplifyLexResult(lex.tokenize(']'))[0],
    'RPAREN',
    'does not accept closing bracket'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('}'))[0],
    'RPAREN',
    'does not accept closing brace'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('('))[0],
    'RPAREN',
    'does not accept opening parentheses'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('['))[0],
    'RPAREN',
    'does not accept opening bracket'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('{'))[0],
    'RPAREN',
    'does not accept opening brace'
  );
});

test('LBRACKET', (t) => {
  // Allowed
  t.is(
    utils.simplifyLexResult(lex.tokenize('['))[0],
    'LBRACKET',
    'accepts opening bracket'
  );

  // Not allowed
  t.not(
    utils.simplifyLexResult(lex.tokenize('('))[0],
    'LBRACKET',
    'does not accept opening parentheses'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('{'))[0],
    'LBRACKET',
    'does not accept opening brace'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize(')'))[0],
    'LBRACKET',
    'does not accept closing parentheses'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize(']'))[0],
    'LBRACKET',
    'does not accept closing bracket'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('}'))[0],
    'LBRACKET',
    'does not accept closing brace'
  );
});

test('RBRACKET', (t) => {
  // Allowed
  t.is(
    utils.simplifyLexResult(lex.tokenize(']'))[0],
    'RBRACKET',
    'accepts closing bracket'
  );

  // Not allowed
  t.not(
    utils.simplifyLexResult(lex.tokenize(')'))[0],
    'RBRACKET',
    'does not accept closing parentheses'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('}'))[0],
    'RBRACKET',
    'does not accept closing brace'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('('))[0],
    'RBRACKET',
    'does not accept opening parentheses'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('['))[0],
    'RBRACKET',
    'does not accept opening bracket'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('{'))[0],
    'RBRACKET',
    'does not accept opening brace'
  );
});

test('Date', (t) => {
  // Separators
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000/01/01'))[0],
    'Date',
    'accepts yyyy/mm/dd'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000-01-01'))[0],
    'Date',
    'accepts yyyy-mm-dd'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000.01.01'))[0],
    'Date',
    'accepts yyyy.mm.dd'
  );

  // Single digit month and date
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000/1/01'))[0],
    'Date',
    'accepts yyyy/m/dd'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000/01/1'))[0],
    'Date',
    'accepts yyyy/mm/d'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000/1/1'))[0],
    'Date',
    'accepts yyyy/m/d'
  );

  // Missing year
  t.is(
    utils.simplifyLexResult(lex.tokenize('01/01'))[0],
    'Date',
    'accepts mm/dd'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('1/01'))[0],
    'Date',
    'accepts m/dd'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('01/1'))[0],
    'Date',
    'accepts mm/d'
  );
  t.is(utils.simplifyLexResult(lex.tokenize('1/1'))[0], 'Date', 'accepts m/d');
});
