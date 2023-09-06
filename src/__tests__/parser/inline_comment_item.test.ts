import anyTest, {TestInterface} from 'ava';

import { CommentModeTokens } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{lexer: MockLexer}>

test.before(t => {
  t.context = {
    lexer: new MockLexer(),
  };
});

test('parses inline comment text', (t) => {
  t.context.lexer.addToken(CommentModeTokens.InlineCommentText, 'an inline comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.inlineCommentItem()),
    {
      InlineCommentText: 1
    },
    '<inlineCommentItem> an inline comment'
  );
});

test('parses inline comment tags', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.inlineCommentItem()),
    {
      tag: [
        {
          InlineCommentTagName: 1,
          InlineCommentTagColon: 1
        }
      ]
    },
    '<inlineCommentItem> tag:'
  );
});

test('does not parse full-line comments as inline', (t) => {
  t.context.lexer.addToken(CommentModeTokens.CommentText, 'full-line comment text token');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.inlineCommentItem(),
    '<inlineCommentItem!> full-line comment text token'
  );
});

test('does not parse an inline comment as an inline comment item', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'an inline comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.inlineCommentItem(),
    '<inlineCommentItem!> ; an inline comment'
  );
});

test('does not parse a hashtag full-line comment as an inline comment item', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.HASHTAG_AT_START, '#')
    .addToken(CommentModeTokens.CommentText, 'a full-line comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.inlineCommentItem(),
    '<inlineCommentItem!> # a full-line comment'
  );
});

test('does not parse an asterisk full-line comment as an inline comment item', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.ASTERISK_AT_START, '*')
    .addToken(CommentModeTokens.CommentText, 'a full-line comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.inlineCommentItem(),
    '<inlineCommentItem!> * a full-line comment'
  );
});

test('does not parse a semicolon full-line comment as an inline comment item', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.SEMICOLON_AT_START, ';')
    .addToken(CommentModeTokens.CommentText, 'a full-line comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.inlineCommentItem(),
    '<inlineCommentItem!> ; a full-line comment'
  );
});
