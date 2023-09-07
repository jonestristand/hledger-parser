import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';

test('returns an account directive with content line', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test:account\n    ; content line\n`).cstJournal
      .children
  );
  t.is(result.length, 1, 'should modify an account directive content line');
  t.is(
    result[0].type,
    'accountDirective',
    'should be a accountDirective object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.contentLines.length,
    1,
    'should contain an accountDirective content line'
  );
});

test('returns an account directive with multiple content lines', (t) => {
  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`account test:account
    ; content line
    ; more content
    ; even more content
`).cstJournal.children
  );
  t.is(
    result.length,
    1,
    'should modify multiple account directive content lines'
  );
  t.is(
    result[0].type,
    'accountDirective',
    'should be a accountDirective object'
  );
  t.is(
    (result[0] as Raw.AccountDirective).value.contentLines.length,
    3,
    'should contain 3 accountDirective content lines'
  );
});
