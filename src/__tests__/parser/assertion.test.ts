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

test('parses a strong balance assertion with subaccount modifier', (t) => {
  t.context.lexer
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.ASTERISK, '*')
    .addToken(BasicTokens.DASH, '-')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.assertion()),
    {
      EQUALS: 2,
      ASTERISK: 1,
      amount: [
        {
          DASH: 1,
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<assertion> ==* -$1.00'
  );
});

test('parses a strong balance assertion', (t) => {
  t.context.lexer
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.DASH, '-')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.assertion()),
    {
      EQUALS: 2,
      amount: [
        {
          DASH: 1,
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<assertion> == -$1.00'
  );
});

test('parses a balance assertion with subaccount modifier', (t) => {
  t.context.lexer
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.ASTERISK, '*')
    .addToken(BasicTokens.DASH, '-')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.assertion()),
    {
      EQUALS: 1,
      ASTERISK: 1,
      amount: [
        {
          DASH: 1,
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<assertion> =* -$1.00'
  );
});

test('parses a balance assertion', (t) => {
  t.context.lexer
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.DASH, '-')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.assertion()),
    {
      EQUALS: 1,
      amount: [
        {
          DASH: 1,
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<assertion> = -$1.00'
  );
});
