import anyTest, { TestInterface } from 'ava';

import {
  AMOUNT_WS,
  AT,
  CommodityText,
  JournalNumber,
  LPAREN,
  RPAREN
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a virtual lot price', (t) => {
  t.context.lexer
    .addToken(LPAREN, '(')
    .addToken(AT, '@')
    .addToken(RPAREN, ')')
    .addToken(AMOUNT_WS, ' ')
    .addToken(JournalNumber, '1.00')
    .addToken(CommodityText, '$');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lotPrice()),
    {
      LPAREN: 1,
      RPAREN: 1,
      AT: 1,
      AMOUNT_WS: 1,
      amount: [
        {
          Number: 1,
          CommodityText: 1
        }
      ]
    },
    '<lotPrice> (@) 1.00$'
  );
});

test('parses a virtual total lot price', (t) => {
  t.context.lexer
    .addToken(LPAREN, '(')
    .addToken(AT, '@')
    .addToken(AT, '@')
    .addToken(RPAREN, ')')
    .addToken(AMOUNT_WS, ' ')
    .addToken(JournalNumber, '1.00')
    .addToken(CommodityText, '$');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lotPrice()),
    {
      LPAREN: 1,
      RPAREN: 1,
      AT: 2,
      AMOUNT_WS: 1,
      amount: [
        {
          Number: 1,
          CommodityText: 1
        }
      ]
    },
    '<lotPrice> (@@) 1.00$'
  );
});

test('parses a lot price', (t) => {
  t.context.lexer
    .addToken(AT, '@')
    .addToken(AMOUNT_WS, ' ')
    .addToken(JournalNumber, '1.00')
    .addToken(CommodityText, '$');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lotPrice()),
    {
      AT: 1,
      AMOUNT_WS: 1,
      amount: [
        {
          Number: 1,
          CommodityText: 1
        }
      ]
    },
    '<lotPrice> @ 1.00$'
  );
});

test('parses a total lot price', (t) => {
  t.context.lexer
    .addToken(AT, '@')
    .addToken(AT, '@')
    .addToken(AMOUNT_WS, ' ')
    .addToken(JournalNumber, '1.00')
    .addToken(CommodityText, '$');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lotPrice()),
    {
      AT: 2,
      AMOUNT_WS: 1,
      amount: [
        {
          Number: 1,
          CommodityText: 1
        }
      ]
    },
    '<lotPrice> @@ 1.00$'
  );
});
