import test from 'ava';

import * as indexInterface from '../index';

test('correctly lexes a properly formatted hledger journal', (t) => {
  const result =
    indexInterface.parseLedgerToCST(`1900/01/01 A transaction ; a comment
    Assets:Chequing        -$1.00 = $99.00
    Expenses:Food

1900/01/01 Investment ; type: mutual fund
    Assets:Chequing       -$20.00 = $79.00
    Assets:Investments     20 funds @ $1.00

account Assets:Chequing
account Expenses:Food ; type: E

# Full-line comment

P 1900/01/02 $ CAD 10.00
`);
  t.is(result.lexErrors.length, 0, 'should not produce any lexer errors');
  t.is(result.parseErrors.length, 0, 'should not produce any parser errors');
  t.is(
    result.cstJournal.name,
    'journal',
    'should have a journal node as top-level'
  );
  t.is(
    result.cstJournal.children.journalItem.length,
    10,
    'should have 10 child nodes'
  );
});

test('does not lex text that is not in hledger format', (t) => {
  const result = indexInterface.parseLedgerToCST('absolutely wrong');
  t.is(result.lexErrors.length, 1, 'should return lexer errors that occur');
});

test('does not lex journal items that are not newline terminated', (t) => {
  const result3 = indexInterface.parseLedgerToCST('P 1900/01/01 $1.00');
  t.is(result3.parseErrors.length, 1, 'should return parser errors that occur');
});

// TODO: May have to write a test for journal items that are EOF terminated.
