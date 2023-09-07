import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns a transaction object containing a posting with a positive amount and commodity', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a transaction posting amount');
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      commodity: '$',
      value: '1'
    },
    'should contain a transaction posting line with an amount'
  );
});

test('returns a transaction object containing a posting with a negative amount and commodity', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  -$1\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting amount with a dash in front of the commodity'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      commodity: '$',
      value: '-1'
    },
    'should contain a transaction posting line with an amount and a dash in front of the commodity'
  );
});

test('returns a transaction object containing a posting with a positive amount and no commodity', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  1\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting amount with no commodity'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      commodity: '',
      value: '1'
    },
    'should contain a transaction posting line with an amount and no commodity'
  );
});
