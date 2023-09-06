import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';

test('returns a comment object when comment is empty', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`#\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify an empty line comment');
  t.is(result[0].type, 'comment', 'should return a comment object');
});

test('returns a comment object when comment contains a single white-space', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`# \n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a line comment of one white-space');
  t.is(result[0].type, 'comment', 'should return a comment object');
});

test('returns a comment object when comment contains multiple white-space', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`#  \t \n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a line comment of multiple white-spaces'
  );
  t.is(result[0].type, 'comment', 'should return a comment object');
});

test('returns a comment object when comment contains text', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`# comment\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a line comment with text');
  t.is(result[0].type, 'comment', 'should return a comment object');
});
