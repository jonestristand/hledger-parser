import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns a transaction object with a description', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 description\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting with a description'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.description,
    'description',
    'should contain a transaction posting line with a description'
  );
});

test('returns a transaction object with a description and memo', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 payee | memo\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting with a payee and memo'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result[0] as Raw.Transaction).value.description,
    {
      payee: 'payee',
      memo: 'memo'
    },
    'should contain a transaction posting line with a payee and memo'
  );
});

// TODO: Write tests wrt the following issue: https://github.com/jonestristand/hledger-parser/issues/2
