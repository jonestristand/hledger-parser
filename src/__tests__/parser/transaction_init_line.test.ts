import anyTest, {TestInterface} from 'ava';

import {
  DateAtStart,
  InlineCommentText,
  NEWLINE,
  ParenValue,
  SemicolonComment,
  Text,
  TxnStatusIndicator
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{lexer: MockLexer}>

test.before(t => {
  t.context = {
    lexer: new MockLexer(),
  };
});

test('parses a transaction init line containing only date', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ]
    },
    '<transactionInitLine>     1900/01/01\\n'
  );
});

test('parses a transaction init line with date and status', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(TxnStatusIndicator, '!')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      statusIndicator: [
        {
          TxnStatusIndicator: 1
        }
      ]
    },
    '<transactionInitLine>     1900/01/01 !\\n'
  );
});

test('parses a transaction init line with date, status, and code', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(TxnStatusIndicator, '!')
    .addToken(ParenValue, '(#443)')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      statusIndicator: [
        {
          TxnStatusIndicator: 1
        }
      ],
      chequeNumber: [
        {
          ParenValue: 1
        }
      ]
    },
    '<transactionInitLine>     1900/01/01 ! (#443)\\n'
  );
});

test('parses a transaction init line with date, status, code, and description', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(TxnStatusIndicator, '!')
    .addToken(ParenValue, '(#443)')
    .addToken(Text, 'description text')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      statusIndicator: [
        {
          TxnStatusIndicator: 1
        }
      ],
      chequeNumber: [
        {
          ParenValue: 1
        }
      ],
      description: [
        {
          Text: 1
        }
      ]
    },
    '<transactionInitLine>     1900/01/01 ! (#443) description text\\n'
  );
});

test('parses a transaction init line with date, status, code, description, and comment', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(TxnStatusIndicator, '!')
    .addToken(ParenValue, '(#443)')
    .addToken(Text, 'description text')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'a comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      statusIndicator: [
        {
          TxnStatusIndicator: 1
        }
      ],
      chequeNumber: [
        {
          ParenValue: 1
        }
      ],
      description: [
        {
          Text: 1
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
    '<transactionInitLine>     1900/01/01 ! (#443) description text ; a comment\\n'
  );
});

test('parses a transaction init line with date, code, description, and comment', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(ParenValue, '(#443)')
    .addToken(Text, 'description text')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'a comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      chequeNumber: [
        {
          ParenValue: 1
        }
      ],
      description: [
        {
          Text: 1
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
    '<transactionInitLine>     1900/01/01 (#443) description text ; a comment\\n'
  );
});

test('parses a transaction init line with date, description, and comment', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(Text, 'description text')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'a comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionInitLine()),
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
    '<transactionInitLine>     1900/01/01 description text ; a comment\\n'
  );
});

test('parses a transaction init line with date and comment', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1900/01/01')
    .addToken(SemicolonComment, ';')
    .addToken(InlineCommentText, 'a comment')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
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
    '<transactionInitLine>     1900/01/01 ; a comment\\n'
  );
});

test('does not parse an empty transaction init line', (t) => {
  t.context.lexer.addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.transactionInitLine(), '<transactionInitLine!> \\n');
});

test('does not parse a transaction init line without newline termination', (t) => {
  t.context.lexer
    .addToken(DateAtStart, '1901/02/02')
    .addToken(Text, 'description text');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionInitLine(),
    '<transactionInitLine!> 1901/02/02 description text'
  );
});
