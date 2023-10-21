import test, { ExecutionContext } from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';
import { assertNoLexingOrParsingErrors } from '../utils';

function assertIsValidTransactionObject(t: ExecutionContext, result: Raw.Journal, message: string) {
  t.is(result.length, 1, message);
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
}

test('returns a transaction object containing a posting with a positive amount and commodity', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  $1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      commodity: '$',
      number: '1',
      value: '$1',
      sign: undefined
    },
    'should contain a transaction posting line with an amount'
  );
});

test('returns a transaction object containing a posting with a negative amount and commodity', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  -$1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a dash in front of the commodity');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '-',
      value: '-$1'
    },
    'should contain a transaction posting line with an amount and a dash in front of the commodity'
  );
});

test('returns a transaction object containing a posting with a positive amount and no commodity', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting amount with no commodity'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      value: '1',
      commodity: undefined,
      sign: undefined
    },
    'should contain a transaction posting line with an amount and no commodity'
  );
});

test('returns a transaction posting with an explicitly positive amount', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  +1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a plus sign');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      sign: '+',
      value: '+1',
      commodity: undefined
    },
    'should contain a transaction posting line with an explicitly positive amount'
  );
});

test('returns a transaction posting with an explicitly positive amount and commodity', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  +$1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a plus sign and commodity');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '+',
      value: '+$1'
    },
    'should contain a transaction posting line with an explicitly positive amount'
  );
});

test('returns a transaction posting with a dash and number space-delimited', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  - 1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a space-delimited dash');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      sign: '-',
      value: '- 1',
      commodity: undefined
    },
    'should contain a transaction posting line with a dash and amount space-delimited'
  );
});

test('returns a transaction posting with a plus and number space-delimited', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  + 1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a space-delimited plus');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      sign: '+',
      value: '+ 1',
      commodity: undefined
    },
    'should contain a transaction posting line with a plus and amount space-delimited'
  );
});

test('returns a transaction posting with a dash and space before a commodity and number', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  - $1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(
    t,
    result,
    'should modify a transaction posting amount with a dash and space before a commodity and number'
  );

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '-',
      value: '- $1'
    },
    'should contain a transaction posting line with a dash and amount space-delimited'
  );
});

test('returns a transaction posting with a plus and space before a commodity and number', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  + $1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(
    t,
    result,
    'should modify a transaction posting amount with a plus and space before a commodity and number'
  );

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '+',
      value: '+ $1'
    },
    'should contain a transaction posting line with a plus and amount space-delimited'
  );
});

test('returns a transaction posting with spaces between dash, commodity, and number', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  - $ 1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(
    t,
    result,
    'should modify a transaction posting amount with spaces between dash, commodity, and number'
  );

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '-',
      value: '- $ 1'
    },
    'should contain a transaction posting line with spaces between dash, commodity, and number'
  );
});

test('returns a transaction posting with spaces between Plus, commodity, and number', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  + $ 1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(
    t,
    result,
    'should modify a transaction posting amount with spaces between plus, commodity, and number'
  );

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '+',
      value: '+ $ 1'
    },
    'should contain a transaction posting line with spaces between plus, commodity, and number'
  );
});

test('returns a transaction posting with a dash and commodity before a space and number', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  -$ 1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(
    t,
    result,
    'should modify a transaction posting amount with a dash and commodity before a space and number'
  );

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '-',
      value: '-$ 1'
    },
    'should contain a transaction posting line with a dash and commodity before a space and number'
  );
});

test('returns a transaction posting with a plus and commodity before a space and number', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  +$ 1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(
    t,
    result,
    'should modify a transaction posting amount with a plus and commodity before a space and number'
  );

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '+',
      value: '+$ 1'
    },
    'should contain a transaction posting line with a plus and commodity before a space and number'
  );
});

test('returns a transaction posting with a commodity and dash in reverse order', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  $-1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a commodity and dash in reverse order');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '-',
      value: '$-1'
    },
    'should contain a transaction posting line with a commodity and dash in reverse order'
  );
});

test('returns a transaction posting with a commodity and plus in reverse order', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  $+1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a commodity and plus in reverse order');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '+',
      value: '$+1'
    },
    'should contain a transaction posting line with a commodity and plus in reverse order'
  );
});

test('returns a transaction posting with a space-delimited commodity and dash in reverse order', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  $ -1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a space-delimited commodity and dash in reverse order');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '-',
      value: '$ -1'
    },
    'should contain a transaction posting line with a space-delimited commodity and dash in reverse order'
  );
});

test('returns a transaction posting with a space-delimited commodity and plus in reverse order', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  $ +1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a space-delimited commodity and plus in reverse order');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '+',
      value: '$ +1'
    },
    'should contain a transaction posting line with a space-delimited commodity and plus in reverse order'
  );
});

test('returns a transaction posting with a reversed order commodity and dash before a space and number', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  $- 1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a reversed order commodity and dash before a space and number');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '-',
      value: '$- 1'
    },
    'should contain a transaction posting line with a reversed order commodity and dash before a space and number'
  );
});

test('returns a transaction posting with a reversed order commodity and plus before a space and dash', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  $+ 1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with a reversed order commodity and plus before a space and number');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '+',
      value: '$+ 1'
    },
    'should contain a transaction posting line with a reversed order commodity and plus before a space and number'
  );
});

test('returns a transaction posting with spaces between reversed order commodity and dash, and number', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  $ - 1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with spaces between reversed order commodity and dash, and number');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '-',
      value: '$ - 1'
    },
    'should contain a transaction posting line with spaces between reversed order commodity and dash, and number'
  );
});

test('returns a transaction posting with spaces between reversed order commodity and plus, and number', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  $ + 1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount with spaces between reversed order commodity and plus, and number');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '+',
      value: '$ + 1'
    },
    'should contain a transaction posting line with spaces between reversed order commodity and plus, and number'
  );
});

test('returns a transaction posting that removes unnecessary whitespace', (t) => {
  const cstResult = parseLedgerToCST(`1900/01/01\n    Account:Test  -   $   1\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidTransactionObject(t, result, 'should modify a transaction posting amount containing multiple whitespace');

  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      number: '1',
      commodity: '$',
      sign: '-',
      value: '- $ 1'
    },
    'should contain a transaction posting line with minimal whitespace'
  );
});
