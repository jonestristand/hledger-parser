import test from 'ava';

import { parseLedgerToRaw } from '../../index';
import RawToCookedVisitor from '../../lib/visitors/raw_to_cooked';

test('parses a single transaction', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`1900/01/01 transaction\n`).rawJournal
  );
  t.is(result.transactions.length, 1, 'should have 1 parsed transaction');
  t.is(result.accounts.length, 0, 'should have 0 parsed account directives');
  t.is(result.prices.length, 0, 'should have 0 parsed price directives');
});

test('parses a single account directive', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`account Account:Test\n`).rawJournal
  );
  t.is(result.transactions.length, 0, 'should have 0 parsed transactions');
  t.is(result.accounts.length, 1, 'should have 1 parsed account directive');
  t.is(result.prices.length, 0, 'should have 0 parsed price directives');
});

test('parses a single price directive', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`P 1900/01/01 CAD $1.00\n`).rawJournal
  );
  t.is(result.transactions.length, 0, 'should have 0 parsed transactions');
  t.is(result.accounts.length, 0, 'should have 0 parsed account directives');
  t.is(result.prices.length, 1, 'should have 1 parsed price directive');
});

// TODO: Include tests for parsing of multiple journal items.
