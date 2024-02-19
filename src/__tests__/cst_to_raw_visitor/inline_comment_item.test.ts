import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns an inline comment object from inline comment text', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test  ; comment text item\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify an inline comment with text');
  t.truthy(
    (result[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should have an array with a single comment item'
  );
});

test('returns an inline comment object from inline comment tag and value', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test  ; comment-tag-item: value\n`).cstJournal
      .children
  );
  t.is(
    result.length,
    1,
    'should modify an inline comment with a tag and value'
  );
  t.truthy(
    (result[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should have an array with a single comment item'
  );
});
