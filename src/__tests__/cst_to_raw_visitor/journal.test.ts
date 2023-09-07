import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';

test('returns empty array if journal is empty', (t) => {
  const undefResult = CstToRawVisitor.journal(
    parseLedgerToCST(``).cstJournal.children
  );
  t.is(undefResult.length, 0, 'should return empty array if journal is empty');
});

test('returns the correct contents of a journal', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 transaction\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should return the contents of a journal');
  t.is(
    result[0].type,
    'transaction',
    'should return the correct contents of a journal'
  );
});
