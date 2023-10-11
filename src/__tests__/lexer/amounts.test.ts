import { runLexerTests } from './utils';

const getExpectedOutput = (expected: unknown[]): unknown[] => {
  return [
    'DateAtStart', 'Text', 'NEWLINE', 'INDENT', { RealAccountName: ['Assets', 'Main Chequing']},
    ...expected,
    'NEWLINE', 'INDENT', { RealAccountName: ['Expenses', 'Electronics'] }, 'NEWLINE'
  ];
};

const tests = [
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'Number' ]),
    title: 'recognizes amounts as whole numbers'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    1000.00
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'Number' ]),
    title: 'recognizes amounts with decimal values'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    -1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'DASH', 'Number' ]),
    title: 'recognizes negative whole number amounts'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    -1000.00
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'DASH', 'Number' ]),
    title: 'recognizes negative amounts with decimal values'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    +1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'PLUS', 'Number' ]),
    title: 'recognizes explicitly positive amounts'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    $1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ { CommodityText: '$' }, 'Number' ]),
    title: 'recognizes amounts with a prefixed commodity symbol'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    1000$
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'Number', { CommodityText: '$' }]),
    title: 'recognizes amounts with a suffixed commodity symbol'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    $ 1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ { CommodityText: '$' }, 'AMOUNT_WS', 'Number' ]),
    title: 'recognizes amounts with a prefixed and space separated commodity symbol'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    1000 $
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'Number', 'AMOUNT_WS', { CommodityText: '$' } ]),
    title: 'recognizes amounts with a suffixed and space separated commodity symbol'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    $-1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ { CommodityText: '$' }, 'DASH', 'Number' ]),
    title: 'recognizes amounts with a dash between symbol and number'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    $- 1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([
      { CommodityText: '$' }, 'DASH', 'AMOUNT_WS', 'Number'
    ]),
    title: 'recognizes amounts with a dash and suffixed space between symbol and number'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    $ -1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([
      { CommodityText: '$' }, 'AMOUNT_WS', 'DASH', 'Number'
    ]),
    title: 'recognizes amounts with a dash and prefixed space between symbol and number'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    $ - 1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([
      { CommodityText: '$' }, 'AMOUNT_WS', 'DASH', 'AMOUNT_WS', 'Number'
    ]),
    title: 'recognizes amounts with a space-wrapped dash between symbol and number'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    -$1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'DASH', { CommodityText: '$' }, 'Number' ]),
    title: 'recognizes amounts with a dash, symbol and number, no spaces'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    - $1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([
      'DASH', 'AMOUNT_WS', { CommodityText: '$' }, 'Number'
    ]),
    title: 'recognizes amounts with a dash and space preceding the symbol and number'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    -$ 1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([
      'DASH', { CommodityText: '$' }, 'AMOUNT_WS', 'Number'
    ]),
    title: 'recognizes amounts with a dash and symbol preceding a space and number'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    - $ 1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([
      'DASH', 'AMOUNT_WS', { CommodityText: '$' }, 'AMOUNT_WS', 'Number'
    ]),
    title: 'recognizes amounts with a dash, symbol and number, all space separated'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    +$1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'PLUS', { CommodityText: '$' }, 'Number' ]),
    title: 'recognizes amounts with a plus, symbol and number'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    $+1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ { CommodityText: '$' }, 'PLUS', 'Number' ]),
    title: 'recognizes amounts with a symbol, plus and number'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    + $ 1000
    Expenses:Electronics\n`,
    expected: getExpectedOutput([
      'PLUS', 'AMOUNT_WS', { CommodityText: '$' }, 'AMOUNT_WS', 'Number'
    ]),
    title: 'recognizes amounts with a plus, symbol and number, all space separated'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    -$1.000,00
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'DASH', { CommodityText: '$' }, 'Number' ]),
    title: 'recognizes amounts with a comma as amount decimal mark'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    -$1 000.00
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'DASH', { CommodityText: '$' }, 'Number' ]),
    title: 'recognizes amounts with a space as amount digit group mark'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    -1,00,00,000.00 INR
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'DASH', 'Number', 'AMOUNT_WS', { CommodityText: 'INR' } ]),
    title: 'recognizes amounts with alternate digit groupings'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    1.00EUR
    Expenses:Electronics\n`,
    expected: getExpectedOutput([ 'Number', { CommodityText: 'EUR' } ]),
    title: 'recognizes amounts with a non-space separated commodity starting with \'E\''
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    $1.00 = $100.00
    Expenses:Electronics\n`,
    expected: getExpectedOutput([
      { CommodityText: '$' }, 'Number', 'AMOUNT_WS', 'EQUALS', 'AMOUNT_WS',
      { CommodityText: '$' }, 'Number'
    ]),
    title: 'recognizes amounts in balance assertions'
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    5 foobar @@ $100.00
    Expenses:Electronics\n`,
    expected: getExpectedOutput([
      'Number', 'AMOUNT_WS', { CommodityText: 'foobar' }, 'AMOUNT_WS', 'AT', 'AT',
      'AMOUNT_WS', { CommodityText: '$' }, 'Number'
    ]),
    title: 'recognizes amounts in lot prices'
    // TODO: Test lot price, then test tabs in lieu of spaces
  },
  {
    pattern: `1900/01/01 transaction
    Assets:Main Chequing    $\t1.00\t =\t $\t100.00
    Expenses:Electronics\n`,
    expected: getExpectedOutput([
      { CommodityText: '$' }, 'AMOUNT_WS', 'Number', 'AMOUNT_WS', 'EQUALS',
      'AMOUNT_WS', { CommodityText: '$' }, 'AMOUNT_WS', 'Number'
    ]),
    title: 'recognizes amounts containing tabs and spaces'
  },
];

runLexerTests(tests);
