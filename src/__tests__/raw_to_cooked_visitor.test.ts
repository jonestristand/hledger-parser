import test from 'ava';
import { DateTime } from 'luxon';

import { parseLedgerToRaw } from '../index';
//import * as Cooked from '../lib/visitors/cooked_types';
import RawToCookedVisitor from '../lib/visitors/raw_to_cooked';

test('journal', (t) => {
  const result1 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/01 transaction\n`).rawJournal
  );
  t.is(result1.transactions.length, 1, 'should have 1 parsed transaction');
  t.is(result1.accounts.length, 0, 'should have 0 parsed account directives');
  t.is(result1.prices.length, 0, 'should have 0 parsed price directives');

  const result2 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`account Account:Test\n`).rawJournal
  );
  t.is(result2.transactions.length, 0, 'should have 0 parsed transactions');
  t.is(result2.accounts.length, 1, 'should have 1 parsed account directive');
  t.is(result2.prices.length, 0, 'should have 0 parsed price directives');

  const result3 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`P 1900/01/01 CAD $1.00\n`).rawJournal
  );
  t.is(result3.transactions.length, 0, 'should have 0 parsed transactions');
  t.is(result3.accounts.length, 0, 'should have 0 parsed account directives');
  t.is(result3.prices.length, 1, 'should have 1 parsed price directive');
});

test('transaction', (t) => {
  const result1 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/02 transaction\n`).rawJournal
  );
  t.is(
    result1.transactions.length,
    1,
    'should have 1 parsed transaction with a date'
  );
  t.deepEqual(
    result1.transactions[0].date,
    { y: 1900, m: 1, d: 2 },
    'should have parsed date'
  );

  const result2 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/01=2020/01/02 transaction\n`).rawJournal
  );
  t.is(
    result2.transactions.length,
    1,
    'should have 1 parsed transaction with a date and a posting date'
  );
  t.deepEqual(
    result2.transactions[0].postingDate,
    { y: 2020, m: 1, d: 2 },
    'should have parsed posting date'
  );

  const result3 = RawToCookedVisitor.journal(
    parseLedgerToRaw(
      `1900/01/01 transaction
        ; tag:value
        Assets:Chequing  $20
        ; tag2:value2\n`
    ).rawJournal
  );
  t.is(
    result3.transactions.length,
    1,
    'should have 1 parsed transaction with inline comment lines'
  );
  t.is(
    result3.transactions[0].tags.length,
    1,
    'should have 1 parsed tag on the transaction'
  );
  t.is(
    result3.transactions[0].postings[0].tags.length,
    1,
    'should have 1 parsed tag on the posting'
  );

  const result4 = RawToCookedVisitor.journal(
    parseLedgerToRaw(
      `1900/01/01 transaction
        Assets:Chequing  $20 ; tag2:value2\n`
    ).rawJournal
  );
  t.is(
    result4.transactions.length,
    1,
    'should have 1 parsed transaction with inline comment on posting line'
  );
  t.is(
    result4.transactions[0].tags.length,
    0,
    'should have 0 tags on the transaction'
  );
  t.is(
    result4.transactions[0].postings[0].tags.length,
    1,
    'should have 1 parsed tag on the posting'
  );

  const result5 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/01 * transaction\n`).rawJournal
  );
  t.is(
    result5.transactions.length,
    1,
    'should have 1 parsed transaction with a status indicator'
  );
  t.is(
    result5.transactions[0].status,
    'cleared',
    'should have parsed status indicator'
  );

  const result6 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/01 (#443) transaction\n`).rawJournal
  );
  t.is(
    result6.transactions.length,
    1,
    'should have 1 parsed transaction with a cheque number'
  );
  t.is(
    result6.transactions[0].chequeNumber,
    '#443',
    'should have parsed cheque number'
  );

  const result7 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/01 transaction\n    Assets:Chequing  $10\n`)
      .rawJournal
  );
  t.is(
    result7.transactions.length,
    1,
    'should have 1 parsed transaction with a posting'
  );
  t.deepEqual(
    result7.transactions[0].postings[0],
    {
      account: { type: 'real', name: ['Assets', 'Chequing'] },
      amount: { commodity: '$', value: '10' },
      assertion: undefined,
      lotPrice: undefined,
      status: 'unmarked',
      tags: []
    },
    'should have parsed posting'
  );
});

test('priceDirective', (t) => {
  const result1 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`P 1900/01/01 $ 10CAD\n`).rawJournal
  );
  t.is(result1.prices.length, 1, 'should have 1 parsed price directive');
  t.deepEqual(
    result1.prices[0],
    {
      date: { y: 1900, m: 1, d: 1 },
      commodity: '$',
      price: {
        commodity: 'CAD',
        value: '10'
      }
    },
    'should have parsed price directive'
  );
});

test('accountDirective', (t) => {
  const result1 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`account Assets:Chequing\n`).rawJournal
  );
  t.is(result1.accounts.length, 1, 'should have 1 parsed account directive');
  t.deepEqual(
    result1.accounts[0],
    {
      account: ['Assets', 'Chequing'],
      tags: []
    },
    'should have parsed account directive'
  );

  const result2 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`account Assets:Chequing ;type: A\n`).rawJournal
  );
  t.is(result2.accounts.length, 1, 'should have 1 parsed account directive');
  t.deepEqual(
    result2.accounts[0],
    {
      account: ['Assets', 'Chequing'],
      tags: [{ name: 'type', value: 'A' }]
    },
    'should have parsed account directive with a tag'
  );

  const result3 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`account Assets:Chequing\n    ;type: A\n`).rawJournal
  );
  t.is(result3.accounts.length, 1, 'should have 1 parsed account directive');
  t.deepEqual(
    result3.accounts[0],
    {
      account: ['Assets', 'Chequing'],
      tags: [{ name: 'type', value: 'A' }]
    },
    'should have parsed account directive with a subdirective tag'
  );

  const result4 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`account Assets:Chequing ;secret:\n    ;type: A\n`)
      .rawJournal
  );
  t.is(result4.accounts.length, 1, 'should have 1 parsed account directive');
  t.deepEqual(
    result4.accounts[0],
    {
      account: ['Assets', 'Chequing'],
      tags: [
        { name: 'secret', value: undefined },
        { name: 'type', value: 'A' }
      ]
    },
    'should have parsed account directive with a subdirective tag and inline tags combined'
  );
});

test('date handling', (t) => {
  const result1 = RawToCookedVisitor.journal(
    parseLedgerToRaw(`01/02 transaction\n`).rawJournal
  );
  t.deepEqual(
    result1.transactions[0].date,
    { y: DateTime.now().year, m: 1, d: 2 },
    'should have parsed date with the current year as the default'
  );

  t.throws(
    () => {
      RawToCookedVisitor.journal(
        parseLedgerToRaw(`2020/15/90 transaction\n`).rawJournal
      );
    },
    null,
    'should throw an error when the date is not a real date'
  );
});
