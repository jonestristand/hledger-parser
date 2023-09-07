import { runLexerTests } from './utils';

const tests = [
  {
    pattern: '01/01\n',
    expected: ['DateAtStart', 'NEWLINE'],
    title: 'recognize a minimal transaction'
  },
  {
    pattern: `1900/01/01 New York Steakhouse
    Assets:Main Chequing  -$23.05 = $100.00
    Expenses:Food\n`,
    expected: [
      'DateAtStart',
      'Text',
      'NEWLINE',
      'INDENT',
      { RealAccountName: ['Assets', 'Main Chequing'] },
      'DASH',
      { CommodityText: '$' },
      'Number',
      'EQUALS',
      { CommodityText: '$' },
      'Number',
      'NEWLINE',
      'INDENT',
      { RealAccountName: ['Expenses', 'Food'] },
      'NEWLINE'
    ],
    title: 'recognize a realistic transaction'
  },
  {
    pattern: `1900/01/01 * (a) payee|memo ; comment and tag: value,
    Assets:Real          -$1.00 @ 20 "green apples" = -$1.00
    (Assets:Virtual)     2CAD @@ 20$ == 0.1
    [Assets:VirtualBal:Sub]  1.3e4 (@@) 0.4 *== 1 ; comment tag1: val1, tag2: val2
    ; another comment with a tag:value\n`,
    expected: [
      'DateAtStart',
      'TxnStatusIndicator',
      { ParenValue: 'a' },
      'Text',
      'PIPE',
      'Text',
      'SemicolonComment',
      'InlineCommentText',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'InlineCommentTagComma',
      'NEWLINE',
      'INDENT',
      { RealAccountName: ['Assets', 'Real'] },
      'DASH',
      { CommodityText: '$' },
      'Number',
      'AT',
      'Number',
      { CommodityText: 'green apples' },
      'EQUALS',
      'DASH',
      { CommodityText: '$' },
      'Number',
      'NEWLINE',
      'INDENT',
      { VirtualAccountName: ['Assets', 'Virtual'] },
      'Number',
      { CommodityText: 'CAD' },
      'AT',
      'AT',
      'Number',
      { CommodityText: '$' },
      'EQUALS',
      'EQUALS',
      'Number',
      'NEWLINE',
      'INDENT',
      { VirtualBalancedAccountName: ['Assets', 'VirtualBal', 'Sub'] },
      'Number',
      'LPAREN',
      'AT',
      'AT',
      'RPAREN',
      'Number',
      'ASTERISK',
      'EQUALS',
      'EQUALS',
      'Number',
      'SemicolonComment',
      'InlineCommentText',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'InlineCommentTagComma',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'NEWLINE',
      'INDENT',
      'SemicolonComment',
      'InlineCommentText',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'NEWLINE'
    ],
    title: 'recognize a maximal transaction'
  }
];

runLexerTests(tests);

// TODO: Add tests with more date patterns: https://hledger.org/1.30/hledger.html#smart-dates
