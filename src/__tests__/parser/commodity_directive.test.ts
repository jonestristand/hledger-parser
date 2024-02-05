import anyTest, { TestInterface } from 'ava';

import {
  AMOUNT_WS,
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

test('does not parse a commodity directive without newline termination', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirective(),
    '<commodityDirective!> commodity CAD'
  );
});

test('does not parse a commodity directive with inline format without newline termination', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirective(),
    '<commodityDirective!> commodity 1000.00CAD'
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
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      CommodityText: 1,
      NEWLINE: 1,
      commodityDirectiveContentLine: [
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
        }
      ]
    },
    '<commodityDirective> commodity CAD\\n    format 1000.00CAD\\n'
  );
});

test('parses a commodity directive with a subdirective comment', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
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
        }
      ]
    },
    '<commodityDirective> commodity 1000.00CAD\\n    ; comment\\n'
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
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
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
      NEWLINE: 1,
      commodityDirectiveContentLine: [
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
        }
      ]
    },
    '<commodityDirective> commodity 1000.00CAD\\n    ; comment\\n    ; comment\\n'
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
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      CommodityText: 1,
      NEWLINE: 1,
      commodityDirectiveContentLine: [
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
              ],
            }
          ]
        },
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
        }
      ]
    },
    '<commodityDirective> commodity CAD\\n    format 1000.00CAD\\n    ; comment\\n'
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
    .addToken(CommodityText, 'USD')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      CommodityText: 1,
      NEWLINE: 1,
      commodityDirectiveContentLine: [
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
        }
      ]
    },
    '<commodityDirective> commodity USD\\n    ; comment\\n    format 1000.00USD\\n'
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
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      CommodityText: 1,
      NEWLINE: 1,
      commodityDirectiveContentLine: [
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
          ],
        },
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
        }
      ]
    },
    '<commodityDirective> commodity CAD\\n    ; comment\\n    format 1000.00CAD\\n    ; comment\\n'
  );
});

test('parses a commodity directive with an inline comment', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(AMOUNT_WS, ' ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      CommodityText: 1,
      AMOUNT_WS: 1,
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
      NEWLINE: 1,
      commodityDirectiveContentLine: [
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
        }
      ]
    },
    '<commodityDirective> commodity CAD ; comment\\n    format 1000.00CAD\\n'
  );
});

test('parses a commodity directive with inline format and an inline comment', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(JournalNumber, '1000.00')
    .addToken(AMOUNT_WS, ' ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      commodityAmount: [
        {
          AMOUNT_WS: 1,
          CommodityText: 1,
          Number: 1
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
    '<commodityDirective> commodity CAD1000.00 ; comment\\n'
  );
});

test('parses a commodity directive with an inline comment and subdirective comments', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(AMOUNT_WS, ' ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(FormatSubdirective, 'format ')
    .addToken(JournalNumber, '1000.00')
    .addToken(CommodityText, 'CAD')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      CommodityText: 1,
      AMOUNT_WS: 1,
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
      NEWLINE: 1,
      commodityDirectiveContentLine: [
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
        }
      ]
    },
    '<commodityDirective> commodity CAD ; comment\\n    ; comment\\n    format 1000.00CAD\\n'
  );
});

test('parses a commodity directive with inline format and an inline comment and subdirective comments', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(JournalNumber, '1000.00')
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
    simplifyCst(HLedgerParser.commodityDirective()),
    {
      CommodityDirective: 1,
      commodityAmount: [
        {
          AMOUNT_WS: 1,
          CommodityText: 1,
          Number: 1
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
      NEWLINE: 1,
      commodityDirectiveContentLine: [
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
        }
      ]
    },
    '<commodityDirective> commodity CAD1000.00 ; comment\\n    ; comment\\n'
  );
});

test('does not parse commodity directive without a space before inline comment', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirective(),
    '<commodityDirective!> commodity CAD;comment'
  );
});

test('does not parse commodity directive with inline format without a space before inline comment', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(JournalNumber, '1000.00')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirective(),
    '<commodityDirective!> commodity CAD1000.00;comment\\n'
  );
});

test('does not parse commodity directive with inline format and inline comment without newline termination', (t) => {
  t.context.lexer
    .addToken(CommodityDirective, 'commodity ')
    .addToken(CommodityText, 'CAD')
    .addToken(JournalNumber, '1000.00')
    .addToken(AMOUNT_WS, ' ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.commodityDirective(),
    '<commodityDirective!> commodity CAD1000.00;comment'
  );
});

// TODO: When other subdirectives are implemented, write tests for ignoring these subdirectives.
//  See https://hledger.org/1.31/hledger.html#commodity-directive
