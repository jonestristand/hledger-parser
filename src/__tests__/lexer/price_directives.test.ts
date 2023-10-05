import { runLexerTests } from './utils';

const tests = [
  {
    pattern: 'P 1900/01/01 $ 1 CAD',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: '$' },
      'Number',
      'AMOUNT_WS',
      { CommodityText: 'CAD' }
    ],
    title: 'recognize currency and alphanumeric commodities'
  },
  {
    pattern: 'P 1900/01/01 $US 1 CAD',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: '$US' },
      'Number',
      'AMOUNT_WS',
      { CommodityText: 'CAD' }
    ],
    title:
      'recognize commodities that are a mix of alphanumeric and currency symbols'
  },
  {
    pattern: 'P 1900/01/01 USD $1',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: 'USD' },
      { CommodityText: '$' },
      'Number'
    ],
    title: 'recognize commodities preceding a price number'
  },
  {
    pattern: 'P 1900/01/01 USD -$1',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: 'USD' },
      'DASH',
      { CommodityText: '$' },
      'Number'
    ],
    title:
      'recognize commodities preceding a price number with a negative in front of the commodity'
  },
  {
    pattern: 'P 1900/01/01 USD +$1',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: 'USD' },
      'PLUS',
      { CommodityText: '$' },
      'Number'
    ],
    title:
      'recognize commodities preceding a price number with a positive in front of the commodity'
  },
  {
    pattern: 'P 1900/01/01 USD $1.199',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: 'USD' },
      { CommodityText: '$' },
      'Number'
    ],
    title: 'recognize numbers with a decimal'
  },
  {
    pattern: 'P 1900/01/01 USD $1,199',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: 'USD' },
      { CommodityText: '$' },
      'Number'
    ],
    title: 'recognize numbers with a comma'
  },
  {
    pattern: 'P 1900/01/01 USD $1,199.02',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: 'USD' },
      { CommodityText: '$' },
      'Number'
    ],
    title: 'recognize numbers with a comma and a decimal'
  },
  {
    pattern: 'P 01/01 USD $1,199.02',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: 'USD' },
      { CommodityText: '$' },
      'Number'
    ],
    title: 'recognize date without a year'
  },
  {
    pattern: 'P 1900/1/01 USD $1,199.02',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: 'USD' },
      { CommodityText: '$' },
      'Number'
    ],
    title: 'recognize date with only 1 month digit'
  },
  {
    pattern: 'P 1900/01/1 USD $1,199.02',
    expected: [
      'PDirective',
      'Date',
      { PDirectiveCommodityText: 'USD' },
      { CommodityText: '$' },
      'Number'
    ],
    title: 'recognize date with only 1 date digit'
  },
  {
    pattern: 'p 1900/01/01 USD -$1',
    expected: [],
    title: 'reject lowercase p for price directive'
  }
];

runLexerTests(tests);
