import anyTest, {TestInterface} from 'ava';

import { BasicTokens, CommentModeTokens } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{lexer: MockLexer}>

test.before(t => {
  t.context = {
    lexer: new MockLexer(),
  };
});

test('parses a semicolon line comment with no content', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.SEMICOLON_AT_START, ';')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      SEMICOLON_AT_START: 1,
      NEWLINE: 1
    },
    '<lineComment> ;\\n'
  );
});

test('parses a hashtag line comment with no content', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.HASHTAG_AT_START, '#')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      HASHTAG_AT_START: 1,
      NEWLINE: 1
    },
    '<lineComment> #\\n'
  );
});

test('parses an asterisk line comment with no content', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.ASTERISK_AT_START, '*')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      ASTERISK_AT_START: 1,
      NEWLINE: 1
    },
    '<lineComment> *\\n'
  );
});

test('parses a semicolon full-line comment', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.SEMICOLON_AT_START, ';')
    .addToken(CommentModeTokens.CommentText, 'a full-line comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      SEMICOLON_AT_START: 1,
      CommentText: 1,
      NEWLINE: 1
    },
    '<lineComment> ; a full-line comment\\n'
  );
});

test('parses a hashtag full-line comment', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.HASHTAG_AT_START, '#')
    .addToken(CommentModeTokens.CommentText, 'a full-line comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      HASHTAG_AT_START: 1,
      CommentText: 1,
      NEWLINE: 1
    },
    '<lineComment> # a full-line comment\\n'
  );
});

test('parses an asterisk full-line comment', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.ASTERISK_AT_START, '*')
    .addToken(CommentModeTokens.CommentText, 'a full-line comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.lineComment()),
    {
      ASTERISK_AT_START: 1,
      CommentText: 1,
      NEWLINE: 1
    },
    '<lineComment> * a full-line comment\\n'
  );
});

test('does not parse an unterminated empty line comment', (t) => {
  t.context.lexer.addToken(CommentModeTokens.SemicolonComment, ';');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.lineComment(), '<lineComment!> ;');
});
