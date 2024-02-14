import anyTest, { TestInterface } from 'ava';

import {
  CommodityText,
  FormatSubdirective,
  JournalNumber,
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a format subdirective', (t) => {
  t.context.lexer
    .addToken(FormatSubdirective, 'format ')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1000.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.formatSubdirective()),
    {
      FormatSubdirective: 1,
      commodityAmount: [
        {
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<formatSubdirective> format $1000.00'
  );
});

test('does not parse a format subdirective without a commodity', (t) => {
  t.context.lexer
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.formatSubdirective(),
    '<formatSubdirective!> format 1000.00'
  );
});

test('does not parse a format subdirective without a number', (t) => {
  t.context.lexer
    .addToken(FormatSubdirective, 'format ')
    .addToken(CommodityText, '$');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.formatSubdirective(),
    '<formatSubdirective!> format $'
  );
});
