import anyTest, { TestInterface } from 'ava';

import {
  AMOUNT_WS,
  CommodityText,
  FormatSubdirective,
  INDENT,
  InlineCommentText,
  JournalNumber,
  NEWLINE,
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

test('parses a content line that is a subdirective comment', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirectiveContentLine()),
    {
      INDENT: 1,
      NEWLINE: 1,
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
    '<commodityDirectiveContentLine>     ; comment\\n'
  );
});

test('parses a content line that is a format subdirective', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(CommodityText, 'CAD')
    .addToken(JournalNumber, '1000.00')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirectiveContentLine()),
    {
      INDENT: 1,
      NEWLINE: 1,
      formatSubdirective: [
        {
          FormatSubdirective: 1,
          commodityAmount: [
            {
              CommodityText: 1,
              Number: 1
            }
          ]
        }
      ]
    },
    '<commodityDirectiveContentLine>     format CAD 1000.00\\n'
  );
});

test('does not parse a content line with unindented format subdirective', (t) => {
  t.context.lexer
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirectiveContentLine(),
    '<commodityDirectiveContentLine!> format 1000.00CAD\\n'
  );
});

test('does not parse a content line with unindented inline comment', (t) => {
  t.context.lexer
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirectiveContentLine(),
    '<commodityDirectiveContentLine!> ; comment\\n'
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
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirectiveContentLine()),
    {
      INDENT: 1,
      NEWLINE: 1,
      formatSubdirective: [
        {
          FormatSubdirective: 1,
          commodityAmount: [
            {
              CommodityText: 1,
              Number: 1,
              AMOUNT_WS: 1
            }
          ]
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
    '<commodityDirectiveContentLine>     format 1000.00CAD ; comment\\n'
  );
});

test('does not parse a format subdirective without a space before inline comment', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirectiveContentLine(),
    '<commodityDirectiveContentLine!>     format 1000.00CAD; comment\\n'
  );
});

test('does not parse a format subdirective without newline termination', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1000.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirectiveContentLine(),
    '<commodityDirectiveContentLine!>     format $1000.00'
  );
});

test('does not parse a format subdirective with an inline comment without newline termination', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(AMOUNT_WS, ' ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirectiveContentLine(),
    '<commodityDirectiveContentLine!>     format 1000.00CAD ; comment'
  );
});

test('does not parse an inline comment without newline termination', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirectiveContentLine(),
    '<commodityDirectiveContentLine!>     ; comment'
  );
});
