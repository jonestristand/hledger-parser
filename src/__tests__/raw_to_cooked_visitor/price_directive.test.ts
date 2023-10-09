import test from 'ava';

import { parseLedgerToRaw } from '../../index';
import RawToCookedVisitor from '../../lib/visitors/raw_to_cooked';

test('parses a price directive', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`P 1900/01/01 $ 10CAD\n`).rawJournal
  );
  t.is(result.prices.length, 1, 'should have 1 parsed price directive');
  t.deepEqual(
    result.prices[0],
    {
      date: { y: 1900, m: 1, d: 1 },
      commodity: '$',
      price: {
        number: '10',
        commodity: 'CAD',
        value: '10CAD',
        sign: undefined
      }
    },
    'should have parsed price directive'
  );
});
