import anyTest, { TestInterface } from 'ava';

import {
  AMOUNT_WS,
  CommodityText,
  DASH,
  DefaultCommodityDirective,
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

test('parses a default commodity directive', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.defaultCommodityDirective()),
    {
      DefaultCommodityDirective: 1,
      commodityAmount: [
        {
          CommodityText: 1,
          Number: 1
        }
      ],
      NEWLINE: 1
    },
    '<defaultCommodityDirective> D 1000.00CAD\\n'
  );
});

test('does not parse a commodity directive without newline termination', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.defaultCommodityDirective(),
    '<defaultCommodityDirective!> D 1000.00CAD'
  );
});

test('does not parse a default commodity directive without a commodity', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(JournalNumber, '1000.00')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.defaultCommodityDirective(),
    '<defaultCommodityDirective!> D 1000.00\\n'
  );
});

test('does not parse a default commodity directive without an amount', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.defaultCommodityDirective(),
    '<defaultCommodityDirective!> D CAD\\n'
  );
});

test('does not parse a default commodity directive without a commodity if amount has a dash', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(DASH, '-')
    .addToken(JournalNumber, '1000.00')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.defaultCommodityDirective(),
    '<defaultCommodityDirective!> D -1000.00\\n'
  );
});

test('does not parse a default commodity directive with format subdirective', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.defaultCommodityDirective(),
    '<defaultCommodityDirective!> D 1000.00CAD\\n    format 1000.00CAD\\n'
  );
});

test('parses a default commodity directive with a subdirective comment', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.defaultCommodityDirective()),
    {
      DefaultCommodityDirective: 1,
      commodityAmount: [
        {
          Number: 1,
          CommodityText: 1,
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
        }
      ]
    },
    '<defaultCommodityDirective> D 1000.00CAD\\n    ; comment\\n'
  );
});

test('parses a default commodity directive with multiple subdirective comments', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.defaultCommodityDirective()),
    {
      DefaultCommodityDirective: 1,
      commodityAmount: [
        {
          Number: 1,
          CommodityText: 1
        }
      ],
      NEWLINE: 3,
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
    '<defaultCommodityDirective> D 1000.00CAD\\n    ; comment\\n    ; comment\\n'
  );
});

test('parses a default commodity directive with an inline comment', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(AMOUNT_WS, ' ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.defaultCommodityDirective()),
    {
      DefaultCommodityDirective: 1,
      commodityAmount: [
        {
          AMOUNT_WS: 1,
          Number: 1,
          CommodityText: 1
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
      ],
      NEWLINE: 1
    },
    '<defaultCommodityDirective> D 1000.00CAD ; comment\\n'
  );
});

test('does not parse a default commodity directive with inline comment without newline termination', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(AMOUNT_WS, ' ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.defaultCommodityDirective(),
    '<defaultCommodityDirective!> D 1000.00CAD ; comment'
  );
});

test('does not parse a default commodity directive without a space before inline comment', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.defaultCommodityDirective(),
    '<defaultCommodityDirective!> D 1000.00CAD; comment\\n'
  );
});

test('parses a default commodity directive with an inline comment and subdirective comments', (t) => {
  t.context.lexer
    .addToken(DefaultCommodityDirective, 'D ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(AMOUNT_WS, ' ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.defaultCommodityDirective()),
    {
      DefaultCommodityDirective: 1,
      commodityAmount: [
        {
          AMOUNT_WS: 1,
          Number: 1,
          CommodityText: 1
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
        }
      ]
    },
    '<defaultCommodityDirective> D 1000.00CAD ; comment\\n    ; comment\\n'
  );
});
