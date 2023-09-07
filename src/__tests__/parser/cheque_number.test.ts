import anyTest, { TestInterface } from 'ava';

import { TxnLineModeTokens } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

// TODO: Proper name is 'transaction code'. This can be used for a cheque number, but is not
//  limited to that usage. https://hledger.org/1.30/hledger.html#code

test('parses a transaction code (cheque number)', (t) => {
  t.context.lexer.addToken(TxnLineModeTokens.ParenValue, '(#443)');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.chequeNumber()),
    {
      ParenValue: 1
    },
    '<chequeNumber> (#443)'
  );
});
