import anyTest, {TestInterface} from 'ava';

import {
  CommodityText,
  JournalNumber,
  NEWLINE,
  PDirective,
  PDirectiveDate
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{lexer: MockLexer}>

test.before(t => {
  t.context = {
    lexer: new MockLexer(),
  };
});

test('parses a price directive line with commodity and price', (t) => {
  t.context.lexer
    .addToken(PDirective, 'P')
    .addToken(PDirectiveDate, '2000/01/01')
    .addToken(CommodityText, '€')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1.50')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.priceDirective()),
    {
      PDirective: 1,
      PDirectiveDate: 1,
      CommodityText: 1,
      NEWLINE: 1,
      amount: [
        {
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<priceDirective> P 2000/01/01 € $1.50\\n'
  );
});

test('does not parse a price directive line without newline termination', (t) => {
  t.context.lexer
    .addToken(PDirective, 'P')
    .addToken(PDirectiveDate, '2000/01/01')
    .addToken(CommodityText, '€')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1.50');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.priceDirective(),
    '<priceDirective!> P 2000/01/01 € $1.50'
  );
});

test('does not parse a price directive line without an amount', (t) => {
  t.context.lexer
    .addToken(PDirective, 'P')
    .addToken(PDirectiveDate, '2000/01/01')
    .addToken(CommodityText, '€')
    .addToken(CommodityText, '$')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.priceDirective(),
    '<priceDirective!> P 2000/01/01 € $\\n'
  );
});

test('does not parse a price directive line without a date', (t) => {
  t.context.lexer
    .addToken(PDirective, 'P')
    .addToken(CommodityText, '€')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1.50')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.priceDirective(), '<priceDirective!> P € $1.50\\n');
});
