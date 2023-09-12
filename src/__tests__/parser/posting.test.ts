import anyTest, { TestInterface } from 'ava';

import {
  AT,
  CommodityText,
  EQUALS,
  InlineCommentText,
  JournalNumber,
  PostingStatusIndicator,
  RealAccountName,
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

test('parses a posting containing account name', (t) => {
  t.context.lexer
    .addToken(RealAccountName, 'Assets:Chequing');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.posting()),
    {
      account: [
        {
          RealAccountName: 1
        }
      ]
    },
    '<posting> Assets:Chequing'
  );
});

test('parses a posting containing status and account name', (t) => {
  t.context.lexer
    .addToken(PostingStatusIndicator, '*')
    .addToken(RealAccountName, 'Assets:Chequing');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.posting()),
    {
      statusIndicator: [
        {
          PostingStatusIndicator: 1
        }
      ],
      account: [
        {
          RealAccountName: 1
        }
      ]
    },
    '<posting> * Assets:Chequing'
  );
});

test('parses a posting containing account name and amount', (t) => {
  t.context.lexer
    .addToken(RealAccountName, 'Assets:Chequing')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.posting()),
    {
      account: [
        {
          RealAccountName: 1
        }
      ],
      amount: [
        {
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<posting> Assets:Chequing    $1.00'
  );
});

test('parses a posting containing account name and unit price', (t) => {
  t.context.lexer
    .addToken(RealAccountName, 'Assets:Chequing')
    .addToken(AT, '@')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.posting()),
    {
      account: [
        {
          RealAccountName: 1
        }
      ],
      lotPrice: [
        {
          AT: 1,
          amount: [
            {
              CommodityText: 1,
              Number: 1
            }
          ]
        }
      ]
    },
    '<posting> Assets:Chequing    @ $1.00'
  );
});

test('parses a posting containing account name and balance assertion', (t) => {
  t.context.lexer
    .addToken(RealAccountName, 'Assets:Chequing')
    .addToken(EQUALS, '=')
    .addToken(CommodityText, '$')
    .addToken(JournalNumber, '1.00');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.posting()),
    {
      account: [
        {
          RealAccountName: 1
        }
      ],
      assertion: [
        {
          EQUALS: 1,
          amount: [
            {
              CommodityText: 1,
              Number: 1
            }
          ]
        }
      ]
    },
    '<posting> Assets:Chequing    = $1.00'
  );
});

test('parses a posting containing account name and inline comment', (t) => {
  t.context.lexer
    .addToken(RealAccountName, 'Assets:Chequing')
    .addToken(SemicolonComment, '=')
    .addToken(InlineCommentText, 'a comment');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.posting()),
    {
      account: [
        {
          RealAccountName: 1
        }
      ],
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
    '<posting> Assets:Chequing  ; a comment'
  );
});

test('does not parse a posting without account name', (t) => {
  t.context.lexer
    .addToken(PostingStatusIndicator, '!')
    .addToken(JournalNumber, '1.00')
    .addToken(CommodityText, '$');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.posting(), '<posting!> ! 1.00$');
});
