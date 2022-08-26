import test from 'ava';

import * as indexInterface from '../';

test('parseLedgerToCST', (t) => {
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

  const result2 = indexInterface.parseLedgerToCST('absolutely wrong');
  t.is(result2.lexErrors.length, 1, 'should return lexer errors that occur');

  const result3 = indexInterface.parseLedgerToCST('P 1900/01/01 $1.00');
  t.is(result3.parseErrors.length, 1, 'should return parser errors that occur');
});

test('parseLedgerToRaw', (t) => {
  const result =
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
`);
  t.is(result.lexErrors.length, 0, 'should not produce any lexer errors');
  t.is(result.parseErrors.length, 0, 'should not produce any parser errors');
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

  const result2 = indexInterface.parseLedgerToCST('absolutely wrong');
  t.is(result2.lexErrors.length, 1, 'should return lexer errors that occur');

  const result3 = indexInterface.parseLedgerToCST('P 1900/01/01 $1.00');
  t.is(result3.parseErrors.length, 1, 'should return parser errors that occur');
});

test('parseLedgerToCooked', (t) => {
  const result =
    indexInterface.parseLedgerToCooked(`1900/01/01 A transaction ; a comment
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

  const result2 = indexInterface.parseLedgerToCST('absolutely wrong');
  t.is(result2.lexErrors.length, 1, 'should return lexer errors that occur');

  const result3 = indexInterface.parseLedgerToCST('P 1900/01/01 $1.00');
  t.is(result3.parseErrors.length, 1, 'should return parser errors that occur');
});

test('cstToRawLedger', (t) => {
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

test('rawToCookedLedger', (t) => {
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
