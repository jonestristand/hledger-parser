import anyTest, { TestInterface } from 'ava';

import { Memo, PIPE, Text } from '../../lib/lexer/tokens';
import HLedgerParser from '../../lib/parser';
import { MockLexer, simplifyCst } from '../utils';

const test = anyTest as TestInterface<{ lexer: MockLexer }>;

test.before((t) => {
  t.context = {
    lexer: new MockLexer()
  };
});

test('parses a description', (t) => {
  t.context.lexer.addToken(Text, 'descriptionText');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.description()),
    {
      Text: 1
    },
    '<description> descriptionText'
  );
});

test('parses a description with a memo', (t) => {
  t.context.lexer
    .addToken(Text, 'payee')
    .addToken(PIPE, '|')
    .addToken(Memo, 'memo');
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.description()),
    {
      Text: 1,
      PIPE: 1,
      Memo: 1
    },
    '<description> payee|memo'
  );
});

test('parses a description with a memo containing pipe characters', (t) => {
  t.context.lexer
    .addToken(Text, 'payee')
    .addToken(PIPE, '|')
    .addToken(Memo, 'memo|note|text')
  HLedgerParser.input = t.context.lexer.tokenize();

  t.deepEqual(
    simplifyCst(HLedgerParser.description()),
    {
      Text: 1,
      PIPE: 1,
      Memo: 1
    },
    '<description> payee|memo|note|text'
  );
});
