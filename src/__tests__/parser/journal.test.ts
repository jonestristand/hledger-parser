import anyTest, {TestInterface} from 'ava';

import { BasicTokens, DefaultModeTokens } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{lexer: MockLexer}>

test.before(t => {
  t.context = {
    lexer: new MockLexer(),
  };
});

test('parses a journal containing a single journal item', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.journal()),
    {
      journalItem: [
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
        }
      ]
    },
    '<journal> 1900/01/01\\n'
  );
});

test('parses a journal containing multiple journal items', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.DateAtStart, '1901/02/02')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.journal()),
    {
      journalItem: [
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
        }
      ]
    },
    '<journal> 1900/01/01\\n1901/02/02\\n'
  );
});

test('does not parse a journal without newline terminated journal items', (t) => {
  t.context.lexer.addToken(DefaultModeTokens.DateAtStart, '1900/03/03');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.journalItem(), '<journalItem!> 1900/03/03');
});
