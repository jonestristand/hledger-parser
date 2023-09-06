import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns a transaction object with no content lines', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 transaction\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a transaction with no content lines');
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines.length,
    0,
    'should have no content lines'
  );
});

test('returns a transaction object with 2 content lines', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(
      `1900/01/01 transaction\n    Assets:Chequing  $10\n    Expenses:Food\n`
    ).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a transaction with no content lines');
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines.length,
    2,
    'should have 2 content lines'
  );
});
