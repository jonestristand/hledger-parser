import test from 'ava';

import * as indexInterface from '../index';

test('converts from concrete syntax tree to raw journal', (t) => {
  const result = indexInterface.cstToRawLedger(
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
`).cstJournal
  );
  t.is(result.length, 6, 'should have 6 items in the parsed object');
  t.is(
    result[0].type,
    'transaction',
    'should have a transaction as the 1st journal item'
  );
  t.is(
    result[1].type,
    'transaction',
    'should have a transaction as the 2nd journal item'
  );
  t.is(
    result[2].type,
    'accountDirective',
    'should have an accountDirective as the 3rd element'
  );
  t.is(
    result[3].type,
    'accountDirective',
    'should have an accountDirective as the 4th element'
  );
  t.is(result[4].type, 'comment', 'should have a comment as the 5th element');
  t.is(
    result[5].type,
    'priceDirective',
    'should have a priceDirective as the 6th element'
  );
});
