import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns a transaction object containing only a date', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a minimal transaction init line');
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: undefined,
      chequeNumber: undefined,
      status: 'unmarked',
      description: '',
      contentLines: [],
      comment: undefined
    },
    'should contain only a date'
  );
});

test('returns a transaction object containing only a date and description', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 description\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction init line with a description'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: undefined,
      chequeNumber: undefined,
      status: 'unmarked',
      description: 'description',
      contentLines: [],
      comment: undefined
    },
    'should contain only a date and a description'
  );
});

test('returns a transaction object containing only a date, code, and description', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 (#443) description\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction init line with a cheque number'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: undefined,
      chequeNumber: '#443',
      status: 'unmarked',
      description: 'description',
      contentLines: [],
      comment: undefined
    },
    'should contain only a cheque number and a description'
  );
});

test('returns a transaction object containing only a date, status, and description', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 * description\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction init line with a status indicator'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: undefined,
      chequeNumber: undefined,
      status: 'cleared',
      description: 'description',
      contentLines: [],
      comment: undefined
    },
    'should contain only a status indicator and a description'
  );
});

test('returns a transaction object containing only a date and a comment', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 ; comment\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction init line with a comment'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: undefined,
      chequeNumber: undefined,
      status: 'unmarked',
      description: '',
      contentLines: [],
      comment: { type: 'inlineComment', value: ['comment'] }
    },
    'should contain only a comment and a description'
  );
});

test('returns a transaction object containing only a date, posting date, and description', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01=2020/01/02 description\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction init line with a posting date'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: '2020/01/02',
      chequeNumber: undefined,
      status: 'unmarked',
      description: 'description',
      contentLines: [],
      comment: undefined
    },
    'should contain only a posting date and a description'
  );
});
