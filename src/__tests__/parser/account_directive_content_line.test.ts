import anyTest, {TestInterface} from 'ava';

import { INDENT, NEWLINE, SemicolonComment } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{lexer: MockLexer}>

test.before(t => {
  t.context = {
    lexer: new MockLexer(),
  };
});

test('parses an account directive content line', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.accountDirectiveContentLine()),
    {
      INDENT: 1,
      NEWLINE: 1,
      inlineComment: [
        {
          SemicolonComment: 1
        }
      ]
    },
    '<accountDirectiveContentLine>     ;\\n'
  );
});

test('does not parse an account directive content line without newline termination', (t) => {
  t.context.lexer
    .addToken(INDENT, '    ')
    .addToken(SemicolonComment, ';');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.accountDirectiveContentLine(),
    '<accountDirectiveContentLine!>     ;'
  );
});

test('does not parse non-indented account directive content line', (t) => {
  t.context.lexer
    .addToken(SemicolonComment, ';')
    .addToken(NEWLINE, '\n');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.falsy(
    HLedgerParser.accountDirectiveContentLine(),
    '<accountDirectiveContentLine!> ;\\n'
  );
});
