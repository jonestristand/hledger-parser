import test from 'ava';

import { parseLedgerToRaw } from '../index';

import { assertNoLexingOrParsingErrors } from './utils';

test('correctly parses a properly formatted hledger journal', (t) => {
  const result =
    parseLedgerToRaw(`1900/01/01 A transaction ; a comment
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

  assertNoLexingOrParsingErrors(t, result);

  t.is(result.rawJournal.length, 6, 'should have 6 items in the parsed object');
  t.is(
    result.rawJournal[0].type,
    'transaction',
    'should have a transaction as the 1st journal item'
  );
  t.is(
    result.rawJournal[1].type,
    'transaction',
    'should have a transaction as the 2nd journal item'
  );
  t.is(
    result.rawJournal[2].type,
    'accountDirective',
    'should have an accountDirective as the 3rd element'
  );
  t.is(
    result.rawJournal[3].type,
    'accountDirective',
    'should have an accountDirective as the 4th element'
  );
  t.is(
    result.rawJournal[4].type,
    'comment',
    'should have a comment as the 5th element'
  );
  t.is(
    result.rawJournal[5].type,
    'priceDirective',
    'should have a priceDirective as the 6th element'
  );
});

test('does not parse text that is not in hledger format', (t) => {
  const result = parseLedgerToRaw('absolutely wrong');
  t.is(result.lexErrors.length, 1, 'should return lexer errors that occur');
});

test('does not parse journal items that are not newline terminated', (t) => {
  t.throws(
    () => parseLedgerToRaw('P 1900/01/01 $1.00'),
    null,
    'should throw an error on parsing non-terminated journal item'
  );
});

// TODO: May have to write a test for journal items that are EOF terminated.
