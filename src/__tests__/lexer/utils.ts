import test from 'ava';

import HLedgerLexer from '../../lib/lexer';
import * as utils from '../utils';

export interface LexerTest {
  pattern: string;
  expected: unknown[];
  title: string;
}

function tokenize(pattern: string) {
  return utils.simplifyLexResult(HLedgerLexer.tokenize(pattern));
}

export function runLexerTests(tests: LexerTest[]) {
  for (const { pattern, expected, title } of tests) {
    test(title, (t) => {
      const result = tokenize(pattern);

      t.deepEqual(result, expected, pattern);
    });
  }
}
