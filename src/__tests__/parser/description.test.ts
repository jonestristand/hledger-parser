import anyTest, {TestInterface} from 'ava';

import { BasicTokens, TxnLineModeTokens } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{lexer: MockLexer}>

test.before(t => {
  t.context = {
    lexer: new MockLexer(),
  };
});

test('parses a description', (t) => {
  t.context.lexer.addToken(TxnLineModeTokens.Text, 'descriptionText');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.description()),
    {
      Text: 1
    },
    '<description> descriptionText'
  );
});

test('parses a description with a single memo', (t) => {
  t.context.lexer
    .addToken(TxnLineModeTokens.Text, 'payee')
    .addToken(BasicTokens.PIPE, '|')
    .addToken(TxnLineModeTokens.Text, 'memo');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.description()),
    {
      Text: 2,
      PIPE: 1
    },
    '<description> payee|memo'
  );
});

// TODO: Write tests wrt the following issue: https://github.com/jonestristand/hledger-parser/issues/2
