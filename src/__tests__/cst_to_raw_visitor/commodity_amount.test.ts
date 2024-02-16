import test, { ExecutionContext } from 'ava';
import { IToken } from 'chevrotain';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';
import { assertIsValidCommodityDirectiveObject, assertNoLexingOrParsingErrors } from '../utils';

function assertCommodityDirectiveHasInlineFormat(t: ExecutionContext, result: Raw.Journal) {
  t.truthy(
    (result[0] as Raw.CommodityDirective).value.format,
    'should contain an inline commodity format'
  );
}

test('returns a commodity directive object containing a commodity amount', (t) => {
  const cstResult = parseLedgerToCST(`commodity $1000.00\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidCommodityDirectiveObject(t, result);
  assertCommodityDirectiveHasInlineFormat(t, result);

  t.deepEqual(
    (result[0] as Raw.CommodityDirective).value.format,
    {
      number: '1000.00',
      commodity: '$',
      value: '$1000.00',
      sign: undefined
    },
    'should contain a commodity directive with inline commodity amount format'
  );
});

test('returns a commodity directive object containing a commodity amount with a space', (t) => {
  const cstResult = parseLedgerToCST(`commodity $ 1000.00\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidCommodityDirectiveObject(t, result);
  assertCommodityDirectiveHasInlineFormat(t, result);

  const amount = (result[0] as Raw.CommodityDirective).value.format;

  t.is(amount?.value, '$ 1000.00', `should contain a commodity amount with a space`);
});

test('returns a commodity directive object containing a commodity amount with a dash', (t) => {
  const cstResult = parseLedgerToCST(`commodity -$1000.00\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidCommodityDirectiveObject(t, result);
  assertCommodityDirectiveHasInlineFormat(t, result);

  const amount = (result[0] as Raw.CommodityDirective).value.format;

  t.is(amount?.sign, '-', 'should contain a commodity amount with a dash');
});

test('returns a commodity directive object containing a commodity amount with a plus', (t) => {
  const cstResult = parseLedgerToCST(`commodity +$1000.00\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidCommodityDirectiveObject(t, result);
  assertCommodityDirectiveHasInlineFormat(t, result);

  const amount = (result[0] as Raw.CommodityDirective).value.format;

  t.is(amount?.sign, '+', 'should contain a commodity amount with a plus');
});

test('returns a commodity directive object containing a commodity amount with multiple spaces', (t) => {
  const cstResult = parseLedgerToCST(`commodity - $ 1 000.00\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidCommodityDirectiveObject(t, result);
  assertCommodityDirectiveHasInlineFormat(t, result);

  const amount = (result[0] as Raw.CommodityDirective).value.format;

  t.is(amount?.value, '- $ 1 000.00', `should contain a commodity amount with multiple spaces`);
});

test('throws an error if amount in commodity directive does not contain commodity text', (t) => {
  t.throws(
    () => {
      CstToRawVisitor.commodityAmount({
        Number: [{
          image: '1000.00'
        }] as IToken[],
        CommodityText: undefined
      });
    },
    {
      message: 'Commodity text must have a value'
    },
    'should throw an error if commodity text not present in commodity amount'
  );
});
