import anyTest, {TestInterface} from 'ava';

import {
  InlineCommentTagColon,
  InlineCommentTagName,
  InlineCommentText,
  SEMICOLON_AT_START,
  SemicolonComment
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{lexer: MockLexer}>

test.before(t => {
  t.context = {
    lexer: new MockLexer(),
  };
});

test('parses an empty inline comment', (t) => {
  t.context.lexer.addToken(SemicolonComment, ';');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.inlineComment()),
    {
      SemicolonComment: 1
    },
    '<inlineComment> ;'
  );
});

test('parses an inline comment containing text', (t) => {
  t.context.lexer
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'an inline comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.inlineComment()),
    {
      SemicolonComment: 1,
      inlineCommentItem: [
        {
          InlineCommentText: 1
        }
      ]
    },
    '<inlineComment> ; an inline comment'
  );
});

test('parses an inline comment containing text and a tag', (t) => {
  t.context.lexer
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'an inline comment')
    .addToken(InlineCommentTagName, 'tag')
    .addToken(InlineCommentTagColon, ':');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.inlineComment()),
    {
      SemicolonComment: 1,
      inlineCommentItem: [
        {
          InlineCommentText: 1
        },
        {
          tag: [
            {
              InlineCommentTagName: 1,
              InlineCommentTagColon: 1
            }
          ]
        }
      ]
    },
    '<inlineComment> ; an inline comment tag:'
  );
});

test('does not parse unindented comments', (t) => {
  t.context.lexer.addToken(SEMICOLON_AT_START, ';');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.inlineComment(), '<inlineComment!> ;');
});
