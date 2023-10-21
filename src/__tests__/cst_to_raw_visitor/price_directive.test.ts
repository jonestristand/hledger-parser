import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';
import { assertNoLexingOrParsingErrors } from '../utils';

test('returns a price directive object', (t) => {
  const cstResult = parseLedgerToCST(`P 1900/01/01 $ 10CAD\n`);

  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  t.is(result.length, 1, 'should modify a price directive');
  t.is(result[0].type, 'priceDirective', 'should be a priceDirective object');
  t.deepEqual(
    (result[0] as Raw.PriceDirective).value,
    {
      date: '1900/01/01',
      commodity: '$',
      price: {
        number: '10',
        commodity: 'CAD',
        value: '10CAD',
        sign: undefined
      }
    },
    'should correctly return all price directive fields'
  );
});
