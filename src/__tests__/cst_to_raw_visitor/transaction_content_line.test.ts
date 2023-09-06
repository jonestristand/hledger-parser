import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns a transaction object with a single posting', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $10\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a transaction posting line');
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines.length,
    1,
    'should contain a transaction content line'
  );
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction content line that is a posting'
  );
});

test('returns a transaction object with a single inline comment', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    ; inline comment\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a transaction comment line');
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines.length,
    1,
    'should contain a transaction content line'
  );
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'inlineComment',
    'should contain a transaction content line that is an inline comment'
  );
});
