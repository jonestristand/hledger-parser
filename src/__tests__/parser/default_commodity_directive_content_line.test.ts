import anyTest, { TestInterface } from 'ava';

import {
  INDENT,
  InlineCommentText,
  NEWLINE,
  SemicolonComment
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a content line that is a subdirective comment', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.defaultCommodityDirectiveContentLine()),
    {
      INDENT: 1,
      NEWLINE: 1,
      inlineComment: [
        {
          SemicolonComment: 1,
          inlineCommentItem: [
            {
              InlineCommentText: 1
            }
          ]
        }
      ]
    },
    '<defaultCommodityDirectiveContentLine>     ; comment\\n'
  );
});

test('does not parse a content line with unindented inline comment', (t) => {
  t.context.lexer
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.defaultCommodityDirectiveContentLine(),
    '<defaultCommodityDirectiveContentLine!> ; comment\\n'
  );
});

test('does not parse an inline comment without newline termination', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.defaultCommodityDirectiveContentLine(),
    '<defaultCommodityDirectiveContentLine!>     ; comment'
  );
});
