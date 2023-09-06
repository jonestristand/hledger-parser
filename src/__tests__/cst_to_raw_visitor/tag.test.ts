import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns a tag object with an undefined value', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ; tag-name:\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a tag with no value');
  t.truthy(
    (result[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should have an array with a single item'
  );
  t.is(
    ((result[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .type,
    'tag',
    'should have an array with a single item that is a tag'
  );
  t.is(
    ((result[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .value.name,
    'tag-name',
    'should have an array with a single item that is a tag with the name "tag-name"'
  );
  t.falsy(
    ((result[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .value.value,
    'should have an array with a single item that is a tag and an undefined value'
  );
});

test('returns a tag object with a value', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ; tag-name: tag-value\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a tag with no value');
  t.truthy(
    (result[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should have an array with a single item'
  );
  t.is(
    ((result[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .type,
    'tag',
    'should have an array with a single item that is a tag'
  );
  t.is(
    ((result[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .value.name,
    'tag-name',
    'should have an array with a single item that is a tag with the name "tag-name"'
  );
  t.is(
    ((result[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .value.value,
    'tag-value',
    'should have an array with a single item that is a tag and the value "tag-value"'
  );
});
