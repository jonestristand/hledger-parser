import anyTest, { TestInterface } from 'ava';

import {
  BasicTokens,
  CommentModeTokens,
  DefaultModeTokens,
  TxnLineModeTokens
} from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a transaction init line containing only date', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(BasicTokens.NEWLINE, '\n');
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
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.TxnStatusIndicator, '!')
    .addToken(BasicTokens.NEWLINE, '\n');
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
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.TxnStatusIndicator, '!')
    .addToken(TxnLineModeTokens.ParenValue, '(#443)')
    .addToken(BasicTokens.NEWLINE, '\n');
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
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.TxnStatusIndicator, '!')
    .addToken(TxnLineModeTokens.ParenValue, '(#443)')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(BasicTokens.NEWLINE, '\n');
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
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.TxnStatusIndicator, '!')
    .addToken(TxnLineModeTokens.ParenValue, '(#443)')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
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
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.ParenValue, '(#443)')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
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
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
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
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
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
  t.context.lexer.addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(HLedgerParser.transactionInitLine(), '<transactionInitLine!> \\n');
});

test('does not parse a transaction init line without newline termination', (t) => {
  t.context.lexer
    .addToken(DefaultModeTokens.DateAtStart, '1901/02/02')
    .addToken(TxnLineModeTokens.Text, 'description text');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionInitLine(),
    '<transactionInitLine!> 1901/02/02 description text'
  );
});
