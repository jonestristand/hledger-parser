import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns a transaction object with an unmarked posting', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting with no status indicator'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .status,
    'unmarked',
    'should contain a transaction posting line with no status indicator'
  );
});

test('returns a transaction object with a pending posting', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    ! Account:Test  $1\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting with a ! status indicator'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .status,
    'pending',
    'should contain a transaction posting line with a ! status indicator'
  );
});

test('returns a transaction object with a cleared posting', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    * Account:Test  $1\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting with a * status indicator'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .status,
    'cleared',
    'should contain a transaction posting line with a * status indicator'
  );
});
