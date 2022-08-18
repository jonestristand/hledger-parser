import test from 'ava';

import HLedgerLexer from '../lib/lexer';

import * as utils from './utils';

// prettier-ignore
test('Price directives', (t) => {
  const tests = [{
      pattern: 'P 1900/01/01 $ 1 CAD',
      result: [ 'PDirective', 'PDirectiveDate', {'CommodityText': '$'}, 'Number', {'CommodityText':'CAD'} ],
      description: 'recognize currency and alphanumeric commodities'
    }, {
      pattern: 'P 1900/01/01 $US 1 CAD',
      result: [ 'PDirective', 'PDirectiveDate', {'CommodityText':'$US'}, 'Number', {'CommodityText':'CAD'} ],
      description: 'recognize commodities that are a mix of alphanumeric and currency symbols'
    }, {
      pattern: 'P 1900/01/01 USD $1',
      result: [ 'PDirective', 'PDirectiveDate', {'CommodityText':'USD'}, {'CommodityText':'$'}, 'Number' ],
      description: 'recognize commodities preceding a price number'
    }, {
      pattern: 'P 1900/01/01 USD -$1',
      result: ['PDirective', 'PDirectiveDate', {'CommodityText':'USD'}, 'DASH', {'CommodityText':'$'}, 'Number' ],
      description: 'recognize commodities preceding a price number with a negative in front of the commodity'
    }, {
      pattern: 'P 1900/01/01 USD $1.199',
      result: [ 'PDirective', 'PDirectiveDate', {'CommodityText':'USD'}, {'CommodityText':'$'}, 'Number' ],
      description: 'recognize numbers with a decimal'
    }, {
      pattern: 'P 1900/01/01 USD $1,199',
      result: [ 'PDirective', 'PDirectiveDate', {'CommodityText':'USD'}, {'CommodityText':'$'}, 'Number' ],
      description: 'recognize numbers with a comma'
    }, {
      pattern: 'P 1900/01/01 USD $1,199.02',
      result: [ 'PDirective', 'PDirectiveDate', {'CommodityText':'USD'}, {'CommodityText':'$'}, 'Number' ],
      description: 'recognize numbers with a comma and a decimal'
    }, {
      pattern: 'P 01/01 USD $1,199.02',
      result: [ 'PDirective', 'PDirectiveDate', {'CommodityText':'USD'}, {'CommodityText':'$'}, 'Number' ],
      description: 'recognize date without a year'
    }, {
      pattern: 'P 1900/1/01 USD $1,199.02',
      result: [ 'PDirective', 'PDirectiveDate', {'CommodityText':'USD'}, {'CommodityText':'$'}, 'Number' ],
      description: 'recognize date with only 1 month digit'
    }, {
      pattern: 'P 1900/01/1 USD $1,199.02',
      result: [ 'PDirective', 'PDirectiveDate', {'CommodityText':'USD'}, {'CommodityText':'$'}, 'Number' ],
      description: 'recognize date with only 1 date digit'
    }, {
      pattern: 'p 1900/01/01 USD -$1',
      result: [],
      description: 'reject lowercase p for price directive',
    },
  ];

  tests.forEach((testPair) => {
    t.deepEqual(
      utils
        .simplifyLexResult(HLedgerLexer.tokenize(testPair.pattern)),
      testPair.result,
      testPair.description
    );
  });
});

// prettier-ignore
test('Account directives', (t) => {
  const tests = [{
      pattern: 'account Assets:Chequing  ',
      result: [ 'AccountDirective', {'RealAccountName': ['Assets', 'Chequing']} ],
      description: 'recognize account directive and name with double-space at end'
    }, {
      pattern: 'account Assets:Chequing\n',
      result: [ 'AccountDirective', {'RealAccountName': ['Assets', 'Chequing']}, 'NEWLINE' ],
      description: 'recognize account directive and name with end of line at end'
    }, {
      pattern: 'account Assets:Chequing ; a comment\n',
      result: [ 'AccountDirective', {'RealAccountName': ['Assets', 'Chequing']},
      'SemicolonComment', 'InlineCommentText', 'NEWLINE' ],
      description: 'recognize account directive and name with comment at end'
    }, {
      pattern: 'account Assets:Chequing ; a comment with: a tag\n',
      result: [ 'AccountDirective', {'RealAccountName': ['Assets', 'Chequing']},
      'SemicolonComment', 'InlineCommentText', 'InlineCommentTagName', 'InlineCommentTagColon',
      'InlineCommentTagValue', 'NEWLINE' ],
      description: 'recognize account directive and name with comment with a tag at end'
    }, {
      pattern: 'account Assets:Chequing\n    ; a comment\n',
      result: [ 'AccountDirective', {'RealAccountName': ['Assets', 'Chequing']}, 'NEWLINE',
      'INDENT', 'SemicolonComment', 'InlineCommentText', 'NEWLINE' ],
      description: 'recognize account directive and name with comment on the next line'
    }, {
      pattern: 'account (Assets:Chequing)  ',
      result: [ 'AccountDirective', { 'RealAccountName': ['(Assets', 'Chequing)'] } ],
      description: 'ignore [ and ( and treat them as part of the account name of a real account (hledger bug)'
    }, {
      pattern: 'account [Assets:Chequing]  ',
      result: [ 'AccountDirective', { 'RealAccountName': ['[Assets', 'Chequing]'] } ],
      description: 'ignore [ and ( and treat them as part of the account name of a real account (hledger bug)'
    },
  ];

  tests.forEach((testPair) => {
    t.deepEqual(
      utils
        .simplifyLexResult(HLedgerLexer.tokenize(testPair.pattern)),
      testPair.result,
      testPair.description
    );
  });
});

// prettier-ignore
test('Full-line comments', (t) => {
  const tests = [{
      pattern: '# a comment',
      result: [ 'HASHTAG_AT_START', 'CommentText' ],
      description: 'recognize full-line comments starting with #'
    }, {
      pattern: '; a comment',
      result: [ 'SEMICOLON_AT_START', 'CommentText' ],
      description: 'recognize full-line comments starting with ;'
    }, {
      pattern: '* a comment',
      result: [ 'ASTERISK_AT_START', 'CommentText' ],
      description: 'recognize full-line comments starting with *'
    }, {
      pattern: '# a comment not-a-tag: not a tag value',
      result: [ 'HASHTAG_AT_START', 'CommentText' ],
      description: 'does not recognize tags in full-line comments'
    },
  ];

  tests.forEach((testPair) => {
    t.deepEqual(
      utils
        .simplifyLexResult(HLedgerLexer.tokenize(testPair.pattern)),
      testPair.result,
      testPair.description
    );
  });
});

// prettier-ignore
test('Transactions', (t) => {
  const tests = [{
      pattern: '01/01\n',
      result: [ 'DateAtStart', 'NEWLINE' ],
      description: 'recognize a minimal transaction'
    }, {
      pattern: `1900/01/01 * (a) payee|memo ; comment and tag: value,
                   Assets:Real          -$1.00 @ 20 "green apples" = -$1.00
                   (Assets:Virtual)     2CAD @@ 20$\n`,
      result: [ 'DateAtStart', 'TxnStatusIndicator', {'ParenValue': 'a'}, 'Text', 'PIPE', 'Text', 'SemicolonComment', 'InlineCommentText', 'InlineCommentTagName', 'InlineCommentTagColon', 'InlineCommentTagValue', 'InlineCommentTagComma', 'NEWLINE',
                'INDENT', {'RealAccountName': ['Assets', 'Real']}, 'DASH', {'CommodityText': '$'}, 'Number', 'AT', 'Number', {'CommodityText': 'green apples'}, 'EQUALS', 'DASH', {'CommodityText': '$'}, 'Number', 'NEWLINE',
                'INDENT', {'VirtualAccountName': ['Assets', 'Virtual']}, 'Number', {'CommodityText': 'CAD'}, 'AT', 'AT', 'Number', {'CommodityText': '$'}, 'NEWLINE'],
      description: 'recognize a maximal transaction'
    }
  ];

  tests.forEach((testPair) => {
    t.deepEqual(
      utils
        .simplifyLexResult(HLedgerLexer.tokenize(testPair.pattern)),
      testPair.result,
      testPair.description
    );
  });
});
