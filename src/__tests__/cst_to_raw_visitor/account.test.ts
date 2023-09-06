import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns a transaction object containing real account posting', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should modify a "real" transaction posting account');
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .account,
    {
      type: 'real',
      name: ['Account', 'Test']
    },
    'should contain a transaction posting line with a real account'
  );
});

test('returns a transaction object containing virtual account posting', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    (Account:Test)\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a "virtual" transaction posting account'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .account,
    {
      type: 'virtual',
      name: ['Account', 'Test']
    },
    'should contain a transaction posting line with a virtual account'
  );
});

test('returns a transaction object containing virtual balanced account posting', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    [Account:Test]\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a "virtual balanced" transaction posting account'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .account,
    {
      type: 'virtualBalanced',
      name: ['Account', 'Test']
    },
    'should contain a transaction posting line with a virtual balanced account'
  );
});
