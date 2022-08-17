import test from 'ava';
import { Lexer } from 'chevrotain';
import _ from 'lodash';

import { BasicTokens, DefaultModeTokens } from '../lib/lexer/tokens';

import * as utils from './utils';

const defaultModeTokensWithoutModes = [
  ..._.values(DefaultModeTokens),
  ..._.values(BasicTokens)
];
defaultModeTokensWithoutModes.forEach((t) => {
  t.POP_MODE = false; // do not pop modes, causes errors as we will not be in a mode
  t.PUSH_MODE = undefined; // do not push modes
  delete t.GROUP;
});
const lex = new Lexer(defaultModeTokensWithoutModes, { skipValidations: true });

test('DateAtStart', (t) => {
  // Separators
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000/01/01')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts yyyy/mm/dd'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000-01-01')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts yyyy-mm-dd'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000.01.01')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts yyyy.mm.dd'
  );

  // Single digit month and date
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000/1/01')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts yyyy/m/dd'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000/01/1')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts yyyy/mm/d'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('2000/1/1')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts yyyy/m/d'
  );

  // Missing year
  t.is(
    utils.simplifyLexResult(lex.tokenize('01/01')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts mm/dd'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('1/01')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts m/dd'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('01/1')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts mm/d'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('1/1')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts m/d'
  );

  // Start of line
  t.is(
    utils.simplifyLexResult(lex.tokenize('2002/02/03')).map((t) => t.n)[0],
    'DateAtStart',
    'accepts DateAtStart at start of file'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('#\n2002/02/03')).map((t) => t.n)[2],
    'DateAtStart',
    'accepts DateAtStart at start of line'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('=2002/03/03')).map((t) => t.n)[1],
    'DateAtStart',
    'does not accept DateAtStart in middle of line'
  );
});

test('INDENT', (t) => {
  // Allowed
  t.is(
    utils.simplifyLexResult(lex.tokenize('  ')).map((t) => t.n)[0],
    'INDENT',
    'accepts two spaces'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('    ')).map((t) => t.n)[0],
    'INDENT',
    'accepts 4 spaces'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('\t')).map((t) => t.n)[0],
    'INDENT',
    'accepts a single tab'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('\t\t')).map((t) => t.n)[0],
    'INDENT',
    'accepts two tabs'
  );

  // Not allowed
  t.not(
    utils.simplifyLexResult(lex.tokenize(' ')).map((t) => t.n)[0],
    'INDENT',
    'does not accept a single space'
  );

  // Start of line
  t.is(
    utils.simplifyLexResult(lex.tokenize('    ')).map((t) => t.n)[0],
    'INDENT',
    'accepts INDENT at beginning of file'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('#\n    ')).map((t) => t.n)[2],
    'INDENT',
    'accepts INDENT at beginning of line'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('=    ')).map((t) => t.n)[1],
    'INDENT',
    'does not accept INDENT in middle of line'
  );
});

test('PDirective', (t) => {
  // Allowed
  t.is(
    utils.simplifyLexResult(lex.tokenize('P')).map((t) => t.n)[0],
    'PDirective',
    'accepts P'
  );

  // Not allowed
  t.not(
    utils.simplifyLexResult(lex.tokenize('p')).map((t) => t.n)[0],
    'PDirective',
    'does not accept p'
  );

  // Start of line
  t.is(
    utils.simplifyLexResult(lex.tokenize('P')).map((t) => t.n)[0],
    'PDirective',
    'accepts PDirective at start of file'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('#\nP')).map((t) => t.n)[2],
    'PDirective',
    'accepts PDirective at start of line'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('=P')).map((t) => t.n)[3],
    'PDirective',
    'does not accept PDirective in middle of line'
  );
});

test('AccountDirective', (t) => {
  // Allowed
  t.is(
    utils.simplifyLexResult(lex.tokenize('account')).map((t) => t.n)[0],
    'AccountDirective',
    'accepts account'
  );

  // Not allowed
  t.not(
    utils.simplifyLexResult(lex.tokenize('Account')).map((t) => t.n)[0],
    'AccountDirective',
    'does not accept Account'
  );
  // Not allowed
  t.not(
    utils.simplifyLexResult(lex.tokenize('aCCOUNT')).map((t) => t.n)[0],
    'AccountDirective',
    'does not accept aCCOUNT'
  );

  // Start of line
  t.is(
    utils.simplifyLexResult(lex.tokenize('account')).map((t) => t.n)[0],
    'AccountDirective',
    'accepts AccountDirective at start of file'
  );
  t.is(
    utils.simplifyLexResult(lex.tokenize('#\naccount')).map((t) => t.n)[2],
    'AccountDirective',
    'accepts AccountDirective at start of line'
  );
  t.not(
    utils.simplifyLexResult(lex.tokenize('=account')).map((t) => t.n)[3],
    'AccountDirective',
    'does not accept AccountDirective in middle of line'
  );
});
