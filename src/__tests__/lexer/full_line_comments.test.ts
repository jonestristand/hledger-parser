import { runLexerTests } from './utils';

const tests = [
  {
    pattern: '# a comment',
    expected: ['HASHTAG_AT_START', 'CommentText'],
    title: 'recognize full-line comments starting with #'
  },
  {
    pattern: '; a comment',
    expected: ['SEMICOLON_AT_START', 'CommentText'],
    title: 'recognize full-line comments starting with ;'
  },
  {
    pattern: '* a comment',
    expected: ['ASTERISK_AT_START', 'CommentText'],
    title: 'recognize full-line comments starting with *'
  },
  {
    pattern: '# a comment not-a-tag: not a tag value',
    expected: ['HASHTAG_AT_START', 'CommentText'],
    title: 'does not recognize tags in full-line comments'
  }
];

runLexerTests(tests);
