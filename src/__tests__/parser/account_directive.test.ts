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

test('parses an account directive', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.accountDirective()),
    {
      AccountDirective: 1,
      RealAccountName: 1,
      NEWLINE: 1
    },
    '<accountDirective>     account Assets:Chequing\\n'
  );
});

test('parses an account directive with inline comment', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.accountDirective()),
    {
      AccountDirective: 1,
      RealAccountName: 1,
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
    '<accountDirective>     account Assets:Chequing ; a comment\\n'
  );
});

test('parses an account directive with a content line', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.accountDirective()),
    {
      AccountDirective: 1,
      RealAccountName: 1,
      NEWLINE: 1,
      accountDirectiveContentLine: [
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
        }
      ]
    },
    '<accountDirective>     account Assets:Chequing\\n    ; a comment\\n'
  );
});

test('parses an account directive with multiple content lines', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'another comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.accountDirective()),
    {
      AccountDirective: 1,
      RealAccountName: 1,
      NEWLINE: 1,
      accountDirectiveContentLine: [
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
        }
      ]
    },
    '<accountDirective>     account Assets:Chequing\\n    ; a comment\\n    ; another comment\\n'
  );
});

test('does not parse virtual account in account directive', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.VirtualAccountName, '(Assets:Chequing)')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.accountDirective(),
    '<accountDirective!>     account (Assets:Chequing)\\n'
  );
});

test('does not parse virtual balanced account in account directive', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.VirtualBalancedAccountName, '[Assets:Chequing]')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.accountDirective(),
    '<accountDirective!>     account [Assets:Chequing]\\n'
  );
});
