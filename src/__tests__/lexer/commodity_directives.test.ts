import { runLexerTests } from './utils';

const tests = [
  {
    pattern: 'commodity USD',
    expected: ['CommodityDirective', { CommodityText: 'USD' }],
    title: 'recognizes a simple commodity directive'
  },
  {
    pattern: 'commodity USD\n',
    expected: ['CommodityDirective', { CommodityText: 'USD' }, 'NEWLINE'],
    title: 'recognizes a simple commodity directive with end of line at end'
  },
  {
    pattern: 'commodity $1000.00',
    expected: ['CommodityDirective', { CommodityText: '$' }, 'Number'],
    title: 'recognizes a commodity directive with inline format definition'
  },
  {
    pattern: 'commodity $1000',
    expected: ['CommodityDirective', { CommodityText: '$' }, 'Number'],
    title: 'recognizes a commodity directive where inline format lacks disambiguating decimal mark'
  },
  {
    pattern: 'commodity $1,000.00',
    expected: ['CommodityDirective', { CommodityText: '$' }, 'Number'],
    title: 'recognizes a commodity directive where inline format has digit group mark'
  },
  {
    pattern: 'commodity 1000.00 USD',
    expected: ['CommodityDirective', 'Number', 'AMOUNT_WS', { CommodityText: 'USD' }],
    title: 'recognizes a commodity directive where commodity text is suffixed and space-separated from number'
  },
  {
    pattern: 'commodity USD 1000.00',
    expected: ['CommodityDirective', { CommodityText: 'USD' }, 'AMOUNT_WS', 'Number'],
    title: 'recognizes a commodity directive where commodity text is prefixed and space-separated from number'
  },
  {
    pattern: 'commodity $1,000.00 ; comment\n',
    expected: ['CommodityDirective', { CommodityText: '$' }, 'Number', 'AMOUNT_WS',
      'SemicolonComment', 'InlineCommentText', 'NEWLINE'],
    title: 'recognizes a commodity directive with inline format and an inline comment'
  },
  {
    pattern: `commodity CAD
    format 1000.00 CAD`,
    expected: ['CommodityDirective', { CommodityText: 'CAD' }, 'NEWLINE', 'INDENT',
      'FormatSubdirective', 'Number', 'AMOUNT_WS', { CommodityText: 'CAD' }],
    title: 'recognizes a format subdirective'
  },
  {
    pattern: `commodity CAD
    format 1000.00 CAD ; comment\n`,
    expected: ['CommodityDirective', { CommodityText: 'CAD' }, 'NEWLINE', 'INDENT',
      'FormatSubdirective', 'Number', 'AMOUNT_WS', { CommodityText: 'CAD' },
      'AMOUNT_WS', 'SemicolonComment', 'InlineCommentText', 'NEWLINE'],
    title: 'recognizes a format subdirective with an inline comment'
  },
  {
    pattern: `commodity CAD
    format 1000.00 CAD
    ; comment\n`,
    expected: ['CommodityDirective', { CommodityText: 'CAD' }, 'NEWLINE', 'INDENT',
      'FormatSubdirective', 'Number', 'AMOUNT_WS', { CommodityText: 'CAD' },
      'NEWLINE', 'INDENT', 'SemicolonComment', 'InlineCommentText', 'NEWLINE'],
    title: 'recognizes a commodity directive with format subdirective and a subdirective comment'
  },
  {
    pattern: `commodity CAD
    ; comment
    format 1000.00 CAD`,
    expected: ['CommodityDirective', { CommodityText: 'CAD' }, 'NEWLINE', 'INDENT',
      'SemicolonComment', 'InlineCommentText', 'NEWLINE', 'INDENT',
      'FormatSubdirective', 'Number', 'AMOUNT_WS', { CommodityText: 'CAD' }],
    title: 'recognizes a commodity directive with subdirective comment preceding format subdirective'
  },
  {
    pattern: `commodity CAD
    ; comment
    ; comment
    format 1000.00 CAD
    ; comment\n`,
    expected: ['CommodityDirective', { CommodityText: 'CAD' }, 'NEWLINE', 'INDENT',
      'SemicolonComment', 'InlineCommentText', 'NEWLINE', 'INDENT',
      'SemicolonComment', 'InlineCommentText', 'NEWLINE', 'INDENT',
      'FormatSubdirective', 'Number', 'AMOUNT_WS', { CommodityText: 'CAD' },
      'NEWLINE', 'INDENT', 'SemicolonComment', 'InlineCommentText', 'NEWLINE'
    ],
    title: 'recognizes a commodity directive with multiple subdirective comments and a format subdirective'
  }
];

runLexerTests(tests);
