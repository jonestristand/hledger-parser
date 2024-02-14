import test from 'ava';

import { parseLedgerToCST } from '../index';

import { assertNoLexingOrParsingErrors } from './utils';


test('correctly lexes a properly formatted hledger journal', (t) => {
  const result =
    parseLedgerToCST(`1900/01/01 A transaction ; a comment
    Assets:Chequing        -$1.00 = $99.00
    Expenses:Food

1900/01/01 Investment ; type: mutual fund
    Assets:Chequing       -$20.00 = $79.00
    Assets:Investments     20 funds @ $1.00

account Assets:Chequing
account Expenses:Food ; type: E

# Full-line comment

P 1900/01/02 $ CAD 10.00

D $1000.00 ; default commodity
    ; This is the default commodity
    ; Additional comments

commodity USD ; American currency
    format 1000.00 USD ; This is the format
    ; Additional comments

commodity CAD1000.00 ; Canadian currency
    ; Additional comments
`);

  assertNoLexingOrParsingErrors(t, result);

  t.is(
    result.cstJournal.name,
    'journal',
    'should have a journal node as top-level'
  );
  t.is(
    result.cstJournal.children.journalItem.length,
    16,
    'should have 16 child nodes'
  );
});

test('does not lex text that is not in hledger format', (t) => {
  const result = parseLedgerToCST('absolutely wrong');
  t.is(result.lexErrors.length, 1, 'should return lexer errors that occur');
});

test('does not lex journal items that are not newline terminated', (t) => {
  const result3 = parseLedgerToCST('P 1900/01/01 $1.00');
  t.is(result3.parseErrors.length, 1, 'should return parser errors that occur');
});

// TODO: May have to write a test for journal items that are EOF terminated.
