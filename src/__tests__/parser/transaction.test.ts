import anyTest, { TestInterface } from 'ava';

import {
  DateAtStart,
  INDENT,
  InlineCommentText,
  JournalDate,
  NEWLINE,
  RealAccountName,
  SemicolonComment,
  Text
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a transaction with only init line with date and description', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(Text, 'description text')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transaction()),
    {
      transactionInitLine: [
        {
          NEWLINE: 1,
          transactionDate: [
            {
              DateAtStart: 1
            }
          ],
          description: [
            {
              Text: 1
            }
          ]
        }
      ]
    },
    '<transaction> 1900/01/01 description text\\n'
  );
});

test('parses a transaction containing one posting without an amount', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(Text, 'description text')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(RealAccountName, 'Assets:Chequing')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transaction()),
    {
      transactionInitLine: [
        {
          NEWLINE: 1,
          transactionDate: [
            {
              DateAtStart: 1
            }
          ],
          description: [
            {
              Text: 1
            }
          ]
        }
      ],
      transactionContentLine: [
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
        }
      ]
    },
    '<transaction> 1900/01/01 description text\\n    Assets:Chequing\\n'
  );
});

test('parses a transaction containing one posting without an amount and an inline comment', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(Text, 'description text')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(RealAccountName, 'Assets:Chequing')
    .addToken(NEWLINE, '\n')
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'a comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transaction()),
    {
      transactionInitLine: [
        {
          NEWLINE: 1,
          transactionDate: [
            {
              DateAtStart: 1
            }
          ],
          description: [
            {
              Text: 1
            }
          ]
        }
      ],
      transactionContentLine: [
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
    '<transaction> 1900/01/01 description text\\n    Assets:Chequing\\n    ; a comment\\n'
  );
});

test('does not parse a transaction with incorrect Date token', (t) => {
  t.context.lexer
    .addToken(JournalDate, '1900/03/03')
    .addToken(Text, 'a description')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.transaction(),
    '<transaction!> 1900/03/03 a description\\n'
  );
});
