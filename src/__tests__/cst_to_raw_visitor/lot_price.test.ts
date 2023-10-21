import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns a transaction object with a posting containing a unit lot price', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1 @ 2CAD\n`).cstJournal
      .children
  );
  t.is(result.length, 1, 'should modify a transaction posting unit lot price');
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .lotPrice,
    {
      lotPriceType: 'unit',
      amount: {
        number: '2',
        commodity: 'CAD',
        value: '2CAD',
        sign: undefined
      }
    },
    'should contain a transaction posting line with a unit lot price'
  );
});

test('returns a transaction object with a posting containing a total lot price', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1 @@ 2CAD\n`).cstJournal
      .children
  );
  t.is(result.length, 1, 'should modify a transaction posting total lot price');
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .lotPrice,
    {
      lotPriceType: 'total',
      amount: {
        number: '2',
        commodity: 'CAD',
        value: '2CAD',
        sign: undefined
      }
    },
    'should contain a transaction posting line with a total lot price'
  );
});
