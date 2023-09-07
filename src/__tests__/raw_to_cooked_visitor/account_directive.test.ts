import test from 'ava';

import { parseLedgerToRaw } from '../../index';
import RawToCookedVisitor from '../../lib/visitors/raw_to_cooked';

test('parses an account directive', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`account Assets:Chequing\n`).rawJournal
  );
  t.is(result.accounts.length, 1, 'should have 1 parsed account directive');
  t.deepEqual(
    result.accounts[0],
    {
      account: ['Assets', 'Chequing'],
      tags: []
    },
    'should have parsed account directive'
  );
});

test('parses an account directive with an inline comment containing a tag and value', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`account Assets:Chequing ;type: A\n`).rawJournal
  );
  t.is(result.accounts.length, 1, 'should have 1 parsed account directive');
  t.deepEqual(
    result.accounts[0],
    {
      account: ['Assets', 'Chequing'],
      tags: [{ name: 'type', value: 'A' }]
    },
    'should have parsed account directive with a tag'
  );
});

test('parses an account directive with a subdirective tag and value', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`account Assets:Chequing\n    ;type: A\n`).rawJournal
  );
  t.is(result.accounts.length, 1, 'should have 1 parsed account directive');
  t.deepEqual(
    result.accounts[0],
    {
      account: ['Assets', 'Chequing'],
      tags: [{ name: 'type', value: 'A' }]
    },
    'should have parsed account directive with a subdirective tag'
  );
});

test('parses an account directive with combined inline and subdirective tags', (t) => {
  const result = RawToCookedVisitor.journal(
    parseLedgerToRaw(`account Assets:Chequing ;secret:\n    ;type: A\n`)
      .rawJournal
  );
  t.is(result.accounts.length, 1, 'should have 1 parsed account directive');
  t.deepEqual(
    result.accounts[0],
    {
      account: ['Assets', 'Chequing'],
      tags: [
        { name: 'secret', value: undefined },
        { name: 'type', value: 'A' }
      ]
    },
    'should have parsed account directive with a subdirective tag and inline tags combined'
  );
});
