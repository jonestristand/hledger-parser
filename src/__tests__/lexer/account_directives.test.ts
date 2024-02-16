import { runLexerTests } from './utils';

const tests = [
  {
    pattern: 'account Assets:Chequing  ',
    expected: ['AccountDirective', { RealAccountName: ['Assets', 'Chequing'] }],
    title: 'recognize account directive and name with double-space at end'
  },
  {
    pattern: 'account Assets:Chequing\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets', 'Chequing'] },
      'NEWLINE'
    ],
    title: 'recognize account directive and name with end of line at end'
  },
  {
    // TODO: Account directive comments require two spaces between that and the account name.
    //  Tests need to be corrected to reflect this format. See: https://hledger.org/1.31/hledger.html#account-comments
    pattern: 'account Assets:Chequing ; a comment\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets', 'Chequing'] },
      'SemicolonComment',
      'InlineCommentText',
      'NEWLINE'
    ],
    title: 'recognize account directive and name with comment at end'
  },
  {
    pattern: 'account Assets:Chequing ; a comment with: a tag\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets', 'Chequing'] },
      'SemicolonComment',
      'InlineCommentText',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'NEWLINE'
    ],
    title: 'recognize account directive and name with comment with a tag at end'
  },
  {
    pattern: 'account Assets:Chequing\n    ; a comment\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets', 'Chequing'] },
      'NEWLINE',
      'INDENT',
      'SemicolonComment',
      'InlineCommentText',
      'NEWLINE'
    ],
    title: 'recognize account directive and name with comment on the next line'
  },
  {
    pattern: 'account (Assets:Chequing)  ',
    expected: [
      'AccountDirective',
      { RealAccountName: ['(Assets', 'Chequing)'] }
    ],
    title:
      'ignore ( and treat it as part of the account name of a real account (hledger bug)'
  },
  {
    pattern: 'account [Assets:Chequing]  ',
    expected: [
      'AccountDirective',
      { RealAccountName: ['[Assets', 'Chequing]'] }
    ],
    title:
      'ignore [ and treat it as part of the account name of a real account (hledger bug)'
  }
];

runLexerTests(tests);
