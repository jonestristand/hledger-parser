import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns an inline comment object when inline comment is empty', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test  ;\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify an empty inline comment');
  t.truthy(
    (result[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.comments?.value.length,
    0,
    'should have an empty array of comment items'
  );
});

test('returns an inline comment object when inline comment contains a single white-space', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test  ; \n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify an inline comment of one white-space');
  t.truthy(
    (result[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.comments?.value.length,
    0,
    'should have an empty array of comment items'
  );
});

test('returns an inline comment object when inline comment contains multiple white-space', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test  ;  \t \n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify an inline comment of multiple white-spaces'
  );
  t.truthy(
    (result[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.comments?.value.length,
    0,
    'should have an empty array of comment items'
  );
});

test('returns an inline comment object when inline comment contains text', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test  ; comment\n`).cstJournal.children
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

test('returns an inline comment object when inline comment contains text, tags, and tag values', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test  ; comment tag-name: tag-value, tag-name2:\n`)
      .cstJournal.children
  );
  t.is(result.length, 1, 'should modify an inline comment with text and a tag');
  t.truthy(
    (result[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.comments?.value.length,
    3,
    'should have an array of three comment items: comment text, and two tags'
  );
});
