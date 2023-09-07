import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns an account directive object', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test:account\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a simple account directive');
  t.is(
    result[0].type,
    'accountDirective',
    'should be a accountDirective object'
  );
  t.deepEqual(
    (result[0] as Raw.AccountDirective).value,
    {
      account: ['test', 'account'],
      comments: undefined,
      contentLines: []
    },
    'should correctly return all account directive fields'
  );
});

test('returns an account directive object with a comment', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test:account ; comment\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a simple account directive with a comment'
  );
  t.is(
    result[0].type,
    'accountDirective',
    'should be a accountDirective object'
  );
  t.truthy(
    (result[0] as Raw.AccountDirective).value.comments,
    'should contain a comment field'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should contain a single comment field'
  );
});

test('returns an account directive object with a content line', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test:account\n    ; sub-directive comment\n`)
      .cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a simple account directive with a sub-directive comment'
  );
  t.is(
    result[0].type,
    'accountDirective',
    'should be a accountDirective object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.contentLines.length,
    1,
    'should contain an accountDirective content line'
  );
});
