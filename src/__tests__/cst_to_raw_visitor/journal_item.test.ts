import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';

test('returns a transaction object', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 transaction\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a transaction');
  t.is(result[0].type, 'transaction', 'should return a transaction object');
});

test('returns a comment object', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`# comment\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a comment\n');
  t.is(result1[0].type, 'comment', 'should return a comment object');

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`; comment\n`).cstJournal.children
  );
  t.is(result2.length, 1, 'should modify a comment\n');
  t.is(result2[0].type, 'comment', 'should return a comment object');

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`* comment\n`).cstJournal.children
  );
  t.is(result3.length, 1, 'should modify a comment\n');
  t.is(result3[0].type, 'comment', 'should return a comment object');
});

test('returns an account directive object', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account Test:Account\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify an account directive');
  t.is(
    result[0].type,
    'accountDirective',
    'should return an account directive object'
  );
});

test('returns a price directive object', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`P 1900/01/01 $ 1.00CAD\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a price directive');
  t.is(
    result[0].type,
    'priceDirective',
    'should return a price directive object'
  );
});

test('returns a commodity directive object', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`commodity CAD1000.00\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a commodity directive');
  t.is(
    result[0].type,
    'commodityDirective',
    'should return a commodity directive object'
  );
});
