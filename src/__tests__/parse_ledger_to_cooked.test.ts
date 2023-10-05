import test from 'ava';

import { parseLedgerToCooked } from '../index';

import { assertNoLexingOrParsingErrors } from './utils';

test('correctly parses a properly formatted hledger journal', (t) => {
  const result =
    parseLedgerToCooked(`1900/01/01 A transaction ; a comment
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

  t.is(
    result.cookedJournal.transactions.length,
    2,
    'should have 2 parsed transactions'
  );
  t.is(
    result.cookedJournal.accounts.length,
    2,
    'should have 2 parsed account directives'
  );
  t.is(
    result.cookedJournal.prices.length,
    1,
    'should have 1 parsed price directive'
  );
});

test('does not parse text that is not in hledger format', (t) => {
  const result = parseLedgerToCooked('absolutely wrong');
  t.is(result.lexErrors.length, 1, 'should return lexer errors that occur');
});

test('does not parse journal items that are not newline terminated', (t) => {
  t.throws(
    () => parseLedgerToCooked('P 1900/01/01 $1.00'),
    null,
    'should throw an error on parsing non-terminated journal item'
  );
});

// TODO: May have to write a test for journal items that are EOF terminated.
