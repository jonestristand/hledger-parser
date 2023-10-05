import anyTest, { TestInterface } from 'ava';

import {
  AMOUNT_WS,
  CommodityText,
  DASH,
  JournalNumber,
  PLUS,
} from '../../lib/lexer/tokens';
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
    .addToken(DASH, '-')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1.00');
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

test('parses a negative amount with leading dash and space separated commodity symbol and number', (t) => {
  t.context.lexer
    .addToken(DASH, '-')
    .addToken(CommodityText, '$')
    .addToken(AMOUNT_WS, ' ')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      DASH: 1,
      Number: 1,
      CommodityText: 1,
      AMOUNT_WS: 1
    },
    '<amount> -$ 1.00'
  );
});

test('parses a negative amount with leading dash and both commodity symbol and number space separated', (t) => {
  t.context.lexer
    .addToken(DASH, '-')
    .addToken(AMOUNT_WS, ' ')
    .addToken(CommodityText, '$')
    .addToken(AMOUNT_WS, ' ')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      DASH: 1,
      Number: 1,
      CommodityText: 1,
      AMOUNT_WS: 2
    },
    '<amount> - $ 1.00'
  );
});

test('parses a positive amount with prepended commodity symbol', (t) => {
  t.context.lexer
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1.00');
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
    .addToken(JournalNumber, '1.00')
    .addToken(CommodityText, '$');
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
  t.context.lexer.addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1
    },
    '<amount> 1.00'
  );
});

test('parses a negative amount with leading commodity symbol', (t) => {
  t.context.lexer
    .addToken(CommodityText, '$')
    .addToken(DASH, '-')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1,
      DASH: 1
    },
    '<amount> $-1.00'
  );
});

test('parses a negative amount with no commodity symbol', (t) => {
  t.context.lexer
    .addToken(DASH, '-')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      DASH: 1
    },
    '<amount> -1.00'
  );
});

test('parses a positive amount with commodity symbol prefixed and space separated', (t) => {
  t.context.lexer
    .addToken(CommodityText, 'CAD')
    .addToken(AMOUNT_WS, ' ')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1,
      AMOUNT_WS: 1
    },
    '<amount> CAD 1.00'
  );
});

test('parses a positive amount with commodity symbol suffixed and space separated', (t) => {
  t.context.lexer
    .addToken(JournalNumber, '1.00')
    .addToken(AMOUNT_WS, ' ')
    .addToken(CommodityText, 'CAD');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      AMOUNT_WS: 1,
      CommodityText: 1
    },
    '<amount> 1.00 CAD'
  );
});

test('parses a negative amount with commodity symbol suffixed and space separated', (t) => {
  t.context.lexer
    .addToken(DASH, ' -')
    .addToken(JournalNumber, '1.00')
    .addToken(AMOUNT_WS, ' ')
    .addToken(CommodityText, 'CAD');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      DASH: 1,
      CommodityText: 1,
      AMOUNT_WS: 1
    },
    '<amount> -1.00 CAD'
  );
});

test('parses a negative amount with leading space separated commodity symbol', (t) => {
  t.context.lexer
    .addToken(CommodityText, 'CAD')
    .addToken(AMOUNT_WS, ' ')
    .addToken(DASH, '-')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1,
      AMOUNT_WS: 1,
      DASH: 1
    },
    '<amount> CAD -1.00'
  );
});

test('parses a negative amount with leading space separated commodity symbol and space separated dash', (t) => {
  t.context.lexer
    .addToken(CommodityText, 'CAD')
    .addToken(AMOUNT_WS, ' ')
    .addToken(DASH, '-')
    .addToken(AMOUNT_WS, ' ')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      AMOUNT_WS: 2,
      CommodityText: 1,
      DASH: 1
    },
    '<amount> CAD - 1.00'
  );
});

test('parses an explicitly positive amount with prepended plus and commodity symbol', (t) => {
  t.context.lexer
    .addToken(PLUS, '+')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1,
      PLUS: 1
    },
    '<amount> +$1.00'
  );
});

test('parses an explicitly positive amount with prepended, space separated plus and prefixed commodity symbol', (t) => {
  t.context.lexer
    .addToken(PLUS, '+')
    .addToken(AMOUNT_WS, ' ')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1,
      PLUS: 1,
      AMOUNT_WS: 1
    },
    '<amount> + $1.00'
  );
});

test('parses an explicitly positive amount with leading commodity symbol', (t) => {
  t.context.lexer
    .addToken(CommodityText, '$')
    .addToken(PLUS, '+')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1,
      PLUS: 1
    },
    '<amount> $+1.00'
  );
});

test('parses an explicitly positive amount with leading space separated commodity symbol', (t) => {
  t.context.lexer
    .addToken(CommodityText, '$')
    .addToken(AMOUNT_WS, ' ')
    .addToken(PLUS, '+')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1,
      AMOUNT_WS: 1,
      PLUS: 1
    },
    '<amount> $ +1.00'
  );
});

test('parses an explicitly positive amount with leading space separated commodity symbol and space separated plus', (t) => {
  t.context.lexer
    .addToken(CommodityText, '$')
    .addToken(AMOUNT_WS, ' ')
    .addToken(PLUS, '+')
    .addToken(AMOUNT_WS, ' ')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1,
      PLUS: 1,
      AMOUNT_WS: 2
    },
    '<amount> $ + 1.00'
  );
});

test('parses an explicitly positive amount', (t) => {
  t.context.lexer
    .addToken(PLUS, '+')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      PLUS: 1
    },
    '<amount> +1.00'
  );
});

test('parses an explicitly positive amount with space separated plus', (t) => {
  t.context.lexer
    .addToken(PLUS, '+')
    .addToken(AMOUNT_WS, ' ')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      PLUS: 1,
      AMOUNT_WS: 1
    },
    '<amount> + 1.00'
  );
});
