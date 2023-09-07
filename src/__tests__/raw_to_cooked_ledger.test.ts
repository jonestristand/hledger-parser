import test from 'ava';

import * as indexInterface from '../index';

test('converts from raw journal to cooked journal', (t) => {
  const result = indexInterface.rawToCookedLedger(
    indexInterface.parseLedgerToRaw(`1900/01/01 A transaction ; a comment
    Assets:Chequing        -$1.00 = $99.00
    Expenses:Food

1900/01/01 Investment ; type: mutual fund
    Assets:Chequing       -$20.00 = $79.00
    Assets:Investments     20 funds @ $1.00

account Assets:Chequing
account Expenses:Food ; type: E

# Full-line comment

P 1900/01/02 $ CAD 10.00
`).rawJournal
  );
  t.is(result.transactions.length, 2, 'should have 2 parsed transactions');
  t.is(result.accounts.length, 2, 'should have 2 parsed account directives');
  t.is(result.prices.length, 1, 'should have 1 parsed price directive');
});
