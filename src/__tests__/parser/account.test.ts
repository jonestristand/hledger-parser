import anyTest, {TestInterface} from 'ava';

import { PostingModeTokens } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{lexer: MockLexer}>

test.before(t => {
  t.context = {
    lexer: new MockLexer(),
  };
});

test('parses a real account name', (t) => {
  t.context.lexer.addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.account()),
    {
      RealAccountName: 1
    },
    '<account> Assets:Chequing'
  );
});

test('parses a virtual account name', (t) => {
  t.context.lexer.addToken(PostingModeTokens.VirtualAccountName, '(Assets:Chequing)');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.account()),
    {
      VirtualAccountName: 1
    },
    '<account> (Assets:Chequing)'
  );
});

test('parses a virtual balanced account name', (t) => {
  t.context.lexer.addToken(
    PostingModeTokens.VirtualBalancedAccountName,
    '[Assets:Chequing]'
  );
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.account()),
    {
      VirtualBalancedAccountName: 1
    },
    '<account> [Assets:Chequing]'
  );
});
