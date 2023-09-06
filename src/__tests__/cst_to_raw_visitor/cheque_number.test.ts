import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

// TODO: Proper name is 'transaction code'. This can be used for a cheque number, but is not
//  limited to that usage. https://hledger.org/1.30/hledger.html#code

test('returns a transaction object containing a transaction code (cheque number)', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 (#443)\n`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify a transaction posting with a cheque number'
  );
  t.is(result[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result[0] as Raw.Transaction).value.chequeNumber,
    '#443',
    'should contain a transaction posting line with a cheque number'
  );
});
