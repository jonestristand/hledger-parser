import anyTest, { TestInterface } from 'ava';

import {
  AMOUNT_WS,
  CommodityText,
  FormatSubdirective,
  INDENT,
  InlineCommentText,
  JournalNumber,
  SemicolonComment
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
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1000.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.formatSubdirective()),
    {
      INDENT: 1,
      FormatSubdirective: 1,
      commodityAmount: [
        {
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<formatSubdirective>     format $1000.00'
  );
});

test('parses a format subdirective with an inline comment', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(AMOUNT_WS, ' ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.formatSubdirective()),
    {
      INDENT: 1,
      FormatSubdirective: 1,
      commodityAmount: [
        {
          CommodityText: 1,
          Number: 1,
          AMOUNT_WS: 1
        }
      ],
      inlineComment: [
        {
          SemicolonComment: 1,
          inlineCommentItem: [
            {
              InlineCommentText: 1
            }
          ]
        }
      ]
    },
    '<formatSubdirective>     format 1000.00CAD ; comment\\n'
  );
});

test('does not parse a format subdirective without a commodity', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.formatSubdirective(),
    '<formatSubdirective!>     format 1000.00'
  );
});

test('does not parse a format subdirective without a number', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(CommodityText, '$');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.formatSubdirective(),
    '<formatSubdirective!>     format $'
  );
});

test('does not parse a format subdirective without an indent', (t) => {
  t.context.lexer
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.formatSubdirective(),
    '<formatSubdirective!> format 1000.00CAD'
  );
});
