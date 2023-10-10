import test, { ExecutionContext } from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

function assertIsValidTransactionObject(t: ExecutionContext, result: Raw.Journal, message: string) {
  t.is(
    result.length,
    1,
    message
  );
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
}

test('returns a transaction object with a posting containing only account name', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test\n`).cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting line with only an account name');

  t.deepEqual(
    (result[0] as Raw.Transaction).value.contentLines[0].value,
    {
      account: {
        type: 'real',
        name: ['Account', 'Test']
      },
      amount: undefined,
      assertion: undefined,
      comment: undefined,
      lotPrice: undefined,
      status: 'unmarked'
    },
    'should contain a transaction content line  with only an account name'
  );
});

test('returns an transaction object containing a posting with an account name and amount', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  10\n`).cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting line with an account name and amount');

  t.deepEqual(
    (result[0] as Raw.Transaction).value.contentLines[0].value,
    {
      account: {
        type: 'real',
        name: ['Account', 'Test']
      },
      amount: {
        number: '10',
        value: '10',
        commodity: undefined,
        sign: undefined
      },
      assertion: undefined,
      comment: undefined,
      lotPrice: undefined,
      status: 'unmarked'
    },
    'should contain a transaction content line with only an account name and amount'
  );
});

test('returns a transaction object containing a posting with an account name and amount with a lot price', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  10 @ 2USD\n`).cstJournal
      .children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting line with an account name and amount with a lot price');

  t.deepEqual(
    (result[0] as Raw.Transaction).value.contentLines[0].value,
    {
      account: {
        type: 'real',
        name: ['Account', 'Test']
      },
      amount: {
        number: '10',
        value: '10 ',
        commodity: undefined,
        sign: undefined
      },
      assertion: undefined,
      comment: undefined,
      lotPrice: {
        lotPriceType: 'unit',
        amount: {
          number: '2',
          commodity: 'USD',
          value: '2USD',
          sign: undefined
        }
      },
      status: 'unmarked'
    },
    'should contain a transaction content line with only an account name and amount with a lot price'
  );
});

test('returns a transaction object with a posting containing an amount and balance assertion', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  10 = 10\n`).cstJournal
      .children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting line with an account name and amount with a balance assertion');

  t.deepEqual(
    (result[0] as Raw.Transaction).value.contentLines[0].value,
    {
      account: {
        type: 'real',
        name: ['Account', 'Test']
      },
      amount: {
        number: '10',
        value: '10 ',
        commodity: undefined,
        sign: undefined
      },
      assertion: {
        type: 'normal',
        subaccounts: false,
        amount: {
          number: '10',
          value: '10',
          commodity: undefined,
          sign: undefined
        }
      },
      comment: undefined,
      lotPrice: undefined,
      status: 'unmarked'
    },
    'should contain a transaction content line with only an account name and amount with a balance assertion'
  );
});

test('returns a transaction object containing a posting with a status', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    ! Account:Test\n`).cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting line with an account name and status indicator');

  t.deepEqual(
    (result[0] as Raw.Transaction).value.contentLines[0].value,
    {
      account: {
        type: 'real',
        name: ['Account', 'Test']
      },
      amount: undefined,
      assertion: undefined,
      comment: undefined,
      lotPrice: undefined,
      status: 'pending'
    },
    'should contain a transaction content line with only an account name and status indicator'
  );
});

test('returns a transaction object wth a posting containing an account name and comment', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test ; a comment\n`).cstJournal
      .children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting line with an account name and a comment');

  t.deepEqual(
    (result[0] as Raw.Transaction).value.contentLines[0].value,
    {
      account: {
        type: 'real',
        name: ['Account', 'Test']
      },
      amount: undefined,
      assertion: undefined,
      comment: { type: 'inlineComment', value: ['a comment'] },
      lotPrice: undefined,
      status: 'unmarked'
    },
    'should contain a transaction content line with only an account name and a comment'
  );
});

// TODO: Test postings without the account name, result should be falsy.
