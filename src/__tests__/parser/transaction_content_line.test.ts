import anyTest, { TestInterface } from 'ava';

import {
  BasicTokens,
  CommentModeTokens,
  DefaultModeTokens,
  PostingModeTokens
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a transaction content line with only account name', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionContentLine()),
    {
      INDENT: 1,
      NEWLINE: 1,
      posting: [
        {
          account: [
            {
              RealAccountName: 1
            }
          ]
        }
      ]
    },
    '<transactionContentLine>     Assets:Chequing\\n'
  );
});

test('parses a transaction content line with only an inline comment', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionContentLine()),
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
    '<transactionContentLine>     ; a comment\\n'
  );
});

test('does not parse an unindented transaction content line containing an account name', (t) => {
  t.context.lexer
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionContentLine(),
    '<transactionContentLine!> Assets:Chequing\\n'
  );
});

test('does not parse a transaction content line containing an account name without newline termination', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionContentLine(),
    '<transactionContentLine!>     Assets:Chequing'
  );
});

test('does not parse an unindented transaction content line containing an inline comment', (t) => {
  t.context.lexer
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.CommentText, 'a comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionContentLine(),
    '<transactionContentLine!> ; a comment\\n'
  );
});

test('does not parse a transaction content line containing an inline comment without newline termination', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.CommentText, 'a comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionContentLine(),
    '<transactionContentLine!>     ; a comment'
  );
});
