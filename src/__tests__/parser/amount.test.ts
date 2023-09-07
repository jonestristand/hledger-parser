import anyTest, { TestInterface } from 'ava';

import { BasicTokens, PostingModeTokens } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a negative amount with commodity symbol next to number', (t) => {
  t.context.lexer
    .addToken(BasicTokens.DASH, '-')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      DASH: 1,
      Number: 1,
      CommodityText: 1
    },
    '<amount> -$1.00'
  );
});

test('parses a positive amount with prepended commodity symbol', (t) => {
  t.context.lexer
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1
    },
    '<amount> $1.00'
  );
});

test('parses a positive amount with appended commodity symbol', (t) => {
  t.context.lexer
    .addToken(PostingModeTokens.Number, '1.00')
    .addToken(PostingModeTokens.CommodityText, '$');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1
    },
    '<amount> 1.00$'
  );
});

test('parses a positive amount with no commodity symbol', (t) => {
  t.context.lexer.addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1
    },
    '<amount> 1.00'
  );
});

// TODO: Test the following valid formats:
//  $-1.00, -1.00, CAD 1.00, 1.00 CAD, -1.00 CAD, CAD -1.00, + $1.00, - $1.00, $-     1.00, +1.00,
//  -CAD 1.00, - CAD 1.00
