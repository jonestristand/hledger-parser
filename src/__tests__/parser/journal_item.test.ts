import anyTest, { TestInterface } from 'ava';

import {
  BasicTokens,
  CommentModeTokens,
  DefaultModeTokens,
  PostingModeTokens,
  PriceModeTokens
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a transaction init line', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.journalItem()),
    {
      transaction: [
        {
          transactionInitLine: [
            {
              NEWLINE: 1,
              transactionDate: [
                {
                  DateAtStart: 1
                }
              ]
            }
          ]
        }
      ]
    },
    '<journalItem> 1900/01/01\\n'
  );
});

test('parses a hash tag full line comment', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.HASHTAG_AT_START, '#')
    .addToken(CommentModeTokens.CommentText, 'a full line comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.journalItem()),
    {
      lineComment: [
        {
          HASHTAG_AT_START: 1,
          CommentText: 1,
          NEWLINE: 1
        }
      ]
    },
    '<journalItem> # a full line comment\\n'
  );
});

test('parses a price directive', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.PDirective, 'P')
    .addToken(PriceModeTokens.PDirectiveDate, '2000/01/02')
    .addToken(PostingModeTokens.CommodityText, '€')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.50')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.journalItem()),
    {
      priceDirective: [
        {
          PDirective: 1,
          PDirectiveDate: 1,
          CommodityText: 1,
          NEWLINE: 1,
          amount: [
            {
              CommodityText: 1,
              Number: 1
            }
          ]
        }
      ]
    },
    '<journalItem> P 2000/01/02 € $1.50\\n'
  );
});

test('parses an account directive', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.journalItem()),
    {
      accountDirective: [
        {
          AccountDirective: 1,
          RealAccountName: 1,
          NEWLINE: 1
        }
      ]
    },
    '<journalItem> account Assets:Chequing\\n'
  );
});

test('does not parse a transaction init line without newline termination', (t) => {
  t.context.lexer.addToken(BasicTokens.Date, '1900/03/03');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    simplifyCst(HLedgerParser.journalItem()),
    '<journalItem!> 1900/03/03'
  );
});

test('does not parse a full line semicolon comment with incorrect token', (t) => {
  t.context.lexer
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(
      CommentModeTokens.CommentText,
      'a comment with wrong semicolon token'
    );
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.journalItem(),
    '<journalItem!> ; a comment with wrong semicolon token'
  );
});
