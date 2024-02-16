import { runLexerTests } from './utils';

const tests = [
  {
    pattern: 'account Assets  ; tag:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'recognizes a tag'
  },
  {
    pattern: 'account Assets  ; tag1:,tag2:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagComma',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'recognizes multiple tags'
  },
  {
    pattern: 'account Assets  ; tag: value\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'NEWLINE'
    ],
    title: 'recognizes a tag with a value'
  },
  {
    pattern: 'account Assets  ; tag1: value1,tag2:value2\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'InlineCommentTagComma',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'NEWLINE'
    ],
    title: 'recognizes multiple tags with values'
  },
  {
    pattern: 'account Assets  ; comment tag:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentText',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'recognizes a comment preceding a tag'
  },
  {
    pattern: 'account Assets  ; tag:, comment\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagComma',
      'InlineCommentText',
      'NEWLINE'
    ],
    title: 'recognizes a tag preceding a comment'
  },
  {
    pattern: 'account Assets  ; tag: value, comment\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'InlineCommentTagComma',
      'InlineCommentText',
      'NEWLINE'
    ],
    title: 'recognizes a tag with a value preceding a comment'
  },
  {
    pattern: 'account Assets  ; tag1:, comment tag2:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagComma',
      'InlineCommentText',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'recognizes a comment between two tags'
  },
  {
    pattern: 'account Assets  ; :tag:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentText',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'ignores colon preceding a tag'
  },
  {
    pattern: 'account Assets  ; :tag1:tag2:tag3:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentText',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'NEWLINE'
    ],
    title: 'recognizes a tag value containing colons'
  },
  {
    pattern: 'account Assets  ; ~`!@#$%^&*()_-+={},[]\\|"\'.<;>tag1:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'recognizes a tag name containing unusual characters'
  },
  {
    pattern: 'account Assets  ; 标签:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'recognizes a tag name containing Unicode characters (Simplified Chinese)'
  },
  {
    pattern: 'account Assets  ; بطاقةشعار:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'recognizes a tag name containing Unicode characters (Arabic)'
  },
  {
    pattern: 'account Assets  ; תָג:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'recognizes a tag name containing Unicode characters (Hebrew)'
  },
  {
    pattern: 'account Assets  ; Тег:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'recognizes a tag name containing Unicode characters (Ukrainian)'
  },
  {
    pattern: 'account Assets  ; ,:value\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'InlineCommentTagValue',
      'NEWLINE'
    ],
    title: 'recognizes a tag name consisting of a single comma'
  },
  {
    pattern: 'account Assets  ; ::::::tag1:\n',
    expected: [
      'AccountDirective',
      { RealAccountName: ['Assets'] },
      'SemicolonComment',
      'InlineCommentText',
      'InlineCommentTagName',
      'InlineCommentTagColon',
      'NEWLINE'
    ],
    title: 'recognizes comment text consisting of repeated colons preceding a tag'
  }
];

runLexerTests(tests);
