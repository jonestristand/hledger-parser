import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns a transaction object with a posting containing a balance assertion', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1 = $2\n`).cstJournal
      .children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting simple balance assertion'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .assertion,
    {
      type: 'normal',
      subaccounts: false,
      amount: {
        number: '2',
        commodity: '$',
        value: '$2',
        sign: undefined
      }
    },
    'should contain a transaction posting line with a simple balance assertion'
  );
});

test('returns a transaction object with a posting containing a strong balance assertion', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1 == $2\n`).cstJournal
      .children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting strong balance assertion'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .assertion,
    {
      type: 'strong',
      subaccounts: false,
      amount: {
        number: '2',
        commodity: '$',
        value: '$2',
        sign: undefined
      }
    },
    'should contain a transaction posting line with a strong balance assertion'
  );
});

test('returns a transaction object with a posting containing a balance assertion with a subaccount modifier', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1 =* $2\n`).cstJournal
      .children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting strong balance assertion with subaccounts'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .assertion,
    {
      type: 'normal',
      subaccounts: true,
      amount: {
        number: '2',
        commodity: '$',
        value: '$2',
        sign: undefined
      }
    },
    'should contain a transaction posting line with a strong balance assertion with subaccounts'
  );
});
