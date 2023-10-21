import test from 'ava';

import { parseLedgerToRaw } from '../../index';
import RawToCookedVisitor from '../../lib/visitors/raw_to_cooked';

test('parses a transaction with a date', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/02 transaction\n`).rawJournal
  );
  t.is(
    result.transactions.length,
    1,
    'should have 1 parsed transaction with a date'
  );
  t.deepEqual(
    result.transactions[0].date,
    { y: 1900, m: 1, d: 2 },
    'should have parsed date'
  );
});

test('parses a transaction with a posting date', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/01=2020/01/02 transaction\n`).rawJournal
  );
  t.is(
    result.transactions.length,
    1,
    'should have 1 parsed transaction with a date and a posting date'
  );
  t.deepEqual(
    result.transactions[0].postingDate,
    { y: 2020, m: 1, d: 2 },
    'should have parsed posting date'
  );
});

test('parses a transaction with content lines', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(
      `1900/01/01 transaction
    ; tag:value
    Assets:Chequing  $20
    ; tag2:value2\n`
    ).rawJournal
  );
  t.is(
    result.transactions.length,
    1,
    'should have 1 parsed transaction with inline comment lines'
  );
  t.is(
    result.transactions[0].tags.length,
    1,
    'should have 1 parsed tag on the transaction'
  );
  t.is(
    result.transactions[0].postings[0].tags.length,
    1,
    'should have 1 parsed tag on the posting'
  );
});

test('parses a transaction with comments on content lines', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(
      `1900/01/01 transaction
        Assets:Chequing  $20 ; tag2:value2\n`
    ).rawJournal
  );
  t.is(
    result.transactions.length,
    1,
    'should have 1 parsed transaction with inline comment on posting line'
  );
  t.is(
    result.transactions[0].tags.length,
    0,
    'should have 0 tags on the transaction'
  );
  t.is(
    result.transactions[0].postings[0].tags.length,
    1,
    'should have 1 parsed tag on the posting'
  );
});

test('parses a transaction with a status', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/01 * transaction\n`).rawJournal
  );
  t.is(
    result.transactions.length,
    1,
    'should have 1 parsed transaction with a status indicator'
  );
  t.is(
    result.transactions[0].status,
    'cleared',
    'should have parsed status indicator'
  );
});

test('parses a transaction with a transaction code', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/01 (#443) transaction\n`).rawJournal
  );
  t.is(
    result.transactions.length,
    1,
    'should have 1 parsed transaction with a cheque number'
  );
  t.is(
    result.transactions[0].chequeNumber,
    '#443',
    'should have parsed cheque number'
  );
});

test('parses a transaction with a posting', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/01 transaction\n    Assets:Chequing  $10\n`)
      .rawJournal
  );
  t.is(
    result.transactions.length,
    1,
    'should have 1 parsed transaction with a posting'
  );
  t.deepEqual(
    result.transactions[0].postings[0],
    {
      account: { type: 'real', name: ['Assets', 'Chequing'] },
      amount: {
        number: '10',
        commodity: '$',
        value: '$10',
        sign: undefined
      },
      assertion: undefined,
      lotPrice: undefined,
      status: 'unmarked',
      tags: []
    },
    'should have parsed posting'
  );
});
