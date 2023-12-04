import anyTest, { TestInterface } from 'ava';

import {
  CommodityDirective,
  CommodityText,
  DASH,
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

test('parses a commodity directive with inline format', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      commodityAmount: [
        {
          CommodityText: 1,
          Number: 1
        }
      ],
      NEWLINE: 1
    },
    '<commodityDirective> commodity 1000.00CAD\\n'
  );
});

test('does not parse a commodity directive without a commodity', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(JournalNumber, '1000.00')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirective(),
    '<commodityDirective!> commodity 1000.00\\n'
  );
});

test('does not parse a commodity directive without a commodity if amount has a dash', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(DASH, '-')
    .addToken(JournalNumber, '1000.00')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirective(),
    '<commodityDirective!> commodity -1000.00\\n'
  );
});

test('parses a commodity directive with format subdirective', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      CommodityText: 1,
      NEWLINE: 1,
      formatSubdirective: [
        {
          INDENT: 1,
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
    '<commodityDirective> commodity CAD\\n    format 1000.00CAD'
  );
});

test('does not parse a commodity directive with invalid format subdirective', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirective(),
    '<commodityDirective!> commodity CAD\\nformat 1000.00CAD'
  );
});

// TODO: This test does not make sense at the parser level, as we should not
//  be concerned with the value of parsed tokens here. Move this test to the
//  commodity directive suite in cst_to_raw_visitor.
// test('does not parse a commodity directive if its commodity differs from that in format subdirective', (t) => {
//   t.context.lexer
//     .addToken(CommodityDirective, 'commodity ')
//     .addToken(CommodityText, 'CAD')
//     .addToken(NEWLINE, '\n')
//     .addToken(INDENT, '    ')
//     .addToken(FormatSubdirective, 'format ')
//     .addToken(JournalNumber, '1000.00')
//     .addToken(CommodityText, 'USD');
//   HLedgerParser.input = t.context.lexer.tokenize();
//
//   t.falsy(
//     HLedgerParser.commodityDirective(),
//     '<commodityDirective!> commodity CAD\\n    format 1000.00USD'
//   );
// });

test('does not parse a commodity directive with inline format if format subdirective exists', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirective(),
    '<commodityDirective!> commodity 1000.00CAD\\n    format 1000.00CAD'
  );
});

test('does not parse a non-inline format commodity directive without format subdirective', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirective(),
    '<commodityDirective!> commodity CAD\\n'
  )
});

test('parses a commodity directive with a subdirective comment', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      commodityAmount: [
        {
          Number: 1,
          CommodityText: 1,
        }
      ],
      NEWLINE: 1,
      commodityDirectiveContentLine: [
        {
          INDENT: 1,
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
        }
      ]
    },
    '<commodityDirective> commodity 1000.00CAD\\n    ; comment'
  );
});

test('parses a commodity directive with multiple subdirective comments', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      commodityAmount: [
        {
          Number: 1,
          CommodityText: 1
        }
      ],
      NEWLINE: 2,
      commodityDirectiveContentLine: [
        {
          INDENT: 1,
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
        {
          INDENT: 1,
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
        }
      ]
    },
    '<commodityDirective> commodity 1000.00CAD\\n    ; comment\\n    ; comment'
  );
});

test('parses a commodity directive with a format subdirective and subdirective comment', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      CommodityText: 1,
      NEWLINE: 2,
      formatSubdirective: [
        {
          INDENT: 1,
          FormatSubdirective: 1,
          commodityAmount: [
            {
              CommodityText: 1,
              Number: 1
            }
          ]
        }
      ],
      commodityDirectiveContentLine: [
        {
          INDENT: 1,
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
        }
      ]
    },
    '<commodityDirective> commodity CAD\\n    format 1000.00CAD\\n    ; comment'
  );
});

test('parses a commodity directive with a subdirective comment preceding a format subdirective', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'USD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'USD');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      CommodityText: 1,
      NEWLINE: 2,
      formatSubdirective: [
        {
          INDENT: 1,
          FormatSubdirective: 1,
          commodityAmount: [
            {
              CommodityText: 1,
              Number: 1
            }
          ]
        }
      ],
      commodityDirectiveContentLine: [
        {
          INDENT: 1,
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
        }
      ]
    },
    '<commodityDirective> commodity USD\\n    ; comment\\n    format 1000.00USD'
  );
});

test('parses a commodity directive with a format subdirective inbetween several subdirective comments', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      CommodityText: 1,
      NEWLINE: 3,
      formatSubdirective: [
        {
          INDENT: 1,
          FormatSubdirective: 1,
          commodityAmount: [
            {
              CommodityText: 1,
              Number: 1
            }
          ]
        }
      ],
      commodityDirectiveContentLine: [
        {
          INDENT: 1,
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
        {
          INDENT: 1,
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
        }
      ]
    },
    '<commodityDirective> commodity CAD\\n    ; comment\\n    format 1000.00CAD\\n    ; comment'
  );
});

// TODO: When other subdirectives are implemented, write tests for ignoring these subdirectives.
//  See https://hledger.org/1.31/hledger.html#commodity-directive
