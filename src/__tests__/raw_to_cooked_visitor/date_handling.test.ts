import test from 'ava';
import { DateTime } from 'luxon';

import { parseLedgerToRaw } from '../../index';
import RawToCookedVisitor from '../../lib/visitors/raw_to_cooked';

test('correctly parses a shorthand date', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`01/02 transaction\n`).rawJournal
  );
  t.deepEqual(
    result.transactions[0].date,
    { y: DateTime.now().year, m: 1, d: 2 },
    'should have parsed date with the current year as the default'
  );

  t.throws(
    () => {
      RawToCookedVisitor.journal(
        parseLedgerToRaw(`2020/15/90 transaction\n`).rawJournal
      );
    },
    null,
    'should throw an error when the date is not a real date'
  );
});

// TODO: There are tests missing for handling smart dates: https://hledger.org/1.30/hledger.html#smart-dates
