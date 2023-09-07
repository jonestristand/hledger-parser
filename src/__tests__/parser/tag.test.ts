import anyTest, { TestInterface } from 'ava';

import { CommentModeTokens } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses an empty tag', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.tag()),
    {
      InlineCommentTagName: 1,
      InlineCommentTagColon: 1
    },
    '<tag> tag:'
  );
});

test('parses a tag containing a value', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':')
    .addToken(CommentModeTokens.InlineCommentTagValue, 'value');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.tag()),
    {
      InlineCommentTagName: 1,
      InlineCommentTagColon: 1,
      InlineCommentTagValue: 1
    },
    '<tag> tag:value'
  );
});

test('parses a comma terminated empty tag', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':')
    .addToken(CommentModeTokens.InlineCommentTagComma, ',');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.tag()),
    {
      InlineCommentTagName: 1,
      InlineCommentTagColon: 1,
      InlineCommentTagComma: 1
    },
    '<tag> tag:,'
  );
});

test('parses a comma terminated tag containing a value', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':')
    .addToken(CommentModeTokens.InlineCommentTagValue, 'value')
    .addToken(CommentModeTokens.InlineCommentTagComma, ',');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.tag()),
    {
      InlineCommentTagName: 1,
      InlineCommentTagColon: 1,
      InlineCommentTagValue: 1,
      InlineCommentTagComma: 1
    },
    '<tag> tag:value,'
  );
});

test('does not parse a tag not containing a colon', (t) => {
  t.context.lexer.addToken(CommentModeTokens.InlineCommentTagName, 'tag');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.journalItem(), '<tag!> tag');
});

test('does not parse a tag value pair not separated by a colon', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagValue, 'value');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.journalItem(), '<tag!> tag value');
});
