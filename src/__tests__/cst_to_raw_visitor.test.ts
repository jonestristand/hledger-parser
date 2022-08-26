import test from 'ava';

import { parseLedgerToCST } from '../index';
import CstToRawVisitor from '../lib/visitors/cst_to_raw';
import * as Raw from '../lib/visitors/raw_types';

test('journal', (t) => {
  const undefResult = CstToRawVisitor.journal(
    parseLedgerToCST(``).cstJournal.children
  );
  t.is(undefResult.length, 0, 'should return empty array if journal is empty');

  const result = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 transaction\n`).cstJournal.children
  );
  t.is(result.length, 1, 'should return the contents of a journal');
  t.is(
    result[0].type,
    'transaction',
    'should return the correct contents of a journal'
  );
});

test('journalItem', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 transaction\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a transaction');
  t.is(result1[0].type, 'transaction', 'should return a transaction object');

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`# comment\n`).cstJournal.children
  );
  t.is(result2.length, 1, 'should modify a comment\n');
  t.is(result2[0].type, 'comment', 'should return a comment object');

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`account Test:Account\n`).cstJournal.children
  );
  t.is(result3.length, 1, 'should modify an account directive');
  t.is(
    result3[0].type,
    'accountDirective',
    'should return an account directive object'
  );

  const result4 = CstToRawVisitor.journal(
    parseLedgerToCST(`P 1900/01/01 $ 1.00CAD\n`).cstJournal.children
  );
  t.is(result4.length, 1, 'should modify a price directive');
  t.is(
    result4[0].type,
    'priceDirective',
    'should return a priceDirective object'
  );
});

test('lineComment', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`#\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify an empty line comment');
  t.is(result1[0].type, 'comment', 'should return a comment object');

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`# \n`).cstJournal.children
  );
  t.is(result2.length, 1, 'should modify a line comment of one white-space');
  t.is(result2[0].type, 'comment', 'should return a comment object');

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`#  \t \n`).cstJournal.children
  );
  t.is(
    result3.length,
    1,
    'should modify a line comment of multiple white-spaces'
  );
  t.is(result3[0].type, 'comment', 'should return a comment object');

  const result4 = CstToRawVisitor.journal(
    parseLedgerToCST(`# comment\n`).cstJournal.children
  );
  t.is(result4.length, 1, 'should modify a line comment with text');
  t.is(result4[0].type, 'comment', 'should return a comment object');
});

test('inlineComment', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ;\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify an empty inline comment');
  t.truthy(
    (result1[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result1[0] as Raw.AccountDirective).value.comments?.value.length,
    0,
    'should have an empty array of comment items'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ; \n`).cstJournal.children
  );
  t.is(result2.length, 1, 'should modify an inline comment of one white-space');
  t.truthy(
    (result2[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result2[0] as Raw.AccountDirective).value.comments?.value.length,
    0,
    'should have an empty array of comment items'
  );

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ;  \t \n`).cstJournal.children
  );
  t.is(
    result3.length,
    1,
    'should modify an inline comment of multiple white-spaces'
  );
  t.truthy(
    (result3[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result3[0] as Raw.AccountDirective).value.comments?.value.length,
    0,
    'should have an empty array of comment items'
  );

  const result4 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ; comment\n`).cstJournal.children
  );
  t.is(result4.length, 1, 'should modify an inline comment with text');
  t.truthy(
    (result4[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result4[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should have an array with a single comment item'
  );

  const result5 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ; comment tag-name: tag-value, tag-name2:\n`)
      .cstJournal.children
  );
  t.is(
    result5.length,
    1,
    'should modify an inline comment with text and a tag'
  );
  t.truthy(
    (result5[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result5[0] as Raw.AccountDirective).value.comments?.value.length,
    3,
    'should have an array of three comment items: comment text, and two tags'
  );
});

test('inlineCommentItem', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ; comment text item\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify an inline comment with text');
  t.truthy(
    (result1[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result1[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should have an array with a single comment item'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ; comment-tag-item: value\n`).cstJournal
      .children
  );
  t.is(
    result2.length,
    1,
    'should modify an inline comment with a tag and value'
  );
  t.truthy(
    (result2[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result2[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should have an array with a single comment item'
  );
});

test('tag', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ; tag-name:\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a tag with no value');
  t.truthy(
    (result1[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result1[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should have an array with a single item'
  );
  t.is(
    ((result1[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .type,
    'tag',
    'should have an array with a single item that is a tag'
  );
  t.is(
    ((result1[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .value.name,
    'tag-name',
    'should have an array with a single item that is a tag with the name "tag-name"'
  );
  t.falsy(
    ((result1[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .value.value,
    'should have an array with a single item that is a tag and an undefined value'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test ; tag-name: tag-value\n`).cstJournal.children
  );
  t.is(result2.length, 1, 'should modify a tag with no value');
  t.truthy(
    (result2[0] as Raw.AccountDirective).value.comments,
    'should contain an inline comment object'
  );
  t.is(
    (result2[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should have an array with a single item'
  );
  t.is(
    ((result2[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .type,
    'tag',
    'should have an array with a single item that is a tag'
  );
  t.is(
    ((result2[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .value.name,
    'tag-name',
    'should have an array with a single item that is a tag with the name "tag-name"'
  );
  t.is(
    ((result2[0] as Raw.AccountDirective).value.comments?.value[0] as Raw.Tag)
      .value.value,
    'tag-value',
    'should have an array with a single item that is a tag and the value "tag-value"'
  );
});

test('transaction', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 transaction\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a transaction with no content lines');
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.contentLines.length,
    0,
    'should have no content lines'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(
      `1900/01/01 transaction\n    Assets:Chequing  $10\n    Expenses:Food\n`
    ).cstJournal.children
  );
  t.is(result2.length, 1, 'should modify a transaction with no content lines');
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result2[0] as Raw.Transaction).value.contentLines.length,
    2,
    'should have 2 content lines'
  );
});

test('priceDirective', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`P 1900/01/01 $ 10CAD\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a price directive');
  t.is(result1[0].type, 'priceDirective', 'should be a priceDirective object');
  t.deepEqual(
    (result1[0] as Raw.PriceDirective).value,
    {
      date: '1900/01/01',
      commodity: '$',
      price: {
        commodity: 'CAD',
        value: '10'
      }
    },
    'should correctly return all price directive fields'
  );
});

test('accountDirective', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test:account\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a simple account directive');
  t.is(
    result1[0].type,
    'accountDirective',
    'should be a accountDirective object'
  );
  t.deepEqual(
    (result1[0] as Raw.AccountDirective).value,
    {
      account: ['test', 'account'],
      comments: undefined,
      contentLines: []
    },
    'should correctly return all account directive fields'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test:account ; comment\n`).cstJournal.children
  );
  t.is(
    result2.length,
    1,
    'should modify a simple account directive with a comment'
  );
  t.is(
    result2[0].type,
    'accountDirective',
    'should be a accountDirective object'
  );
  t.truthy(
    (result2[0] as Raw.AccountDirective).value.comments,
    'should contain a comment field'
  );
  t.is(
    (result2[0] as Raw.AccountDirective).value.comments?.value.length,
    1,
    'should contain a single comment field'
  );

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test:account\n    ; sub-directive comment\n`)
      .cstJournal.children
  );
  t.is(
    result3.length,
    1,
    'should modify a simple account directive with a sub-directive comment'
  );
  t.is(
    result3[0].type,
    'accountDirective',
    'should be a accountDirective object'
  );
  t.is(
    (result3[0] as Raw.AccountDirective).value.contentLines.length,
    1,
    'should contain an accountDirective content line'
  );
});

test('accountDirectiveContentLine', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`account test:account\n    ; content line\n`).cstJournal
      .children
  );
  t.is(result1.length, 1, 'should modify an account directive content line');
  t.is(
    result1[0].type,
    'accountDirective',
    'should be a accountDirective object'
  );
  t.is(
    (result1[0] as Raw.AccountDirective).value.contentLines.length,
    1,
    'should contain an accountDirective content line'
  );
});

test('transactionInitLine', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a minimal transaction init line');
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result1[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: undefined,
      chequeNumber: undefined,
      status: 'unmarked',
      description: '',
      contentLines: [],
      comment: undefined
    },
    'should contain only a date'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 description\n`).cstJournal.children
  );
  t.is(
    result2.length,
    1,
    'should modify a transaction init line with a description'
  );
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result2[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: undefined,
      chequeNumber: undefined,
      status: 'unmarked',
      description: 'description',
      contentLines: [],
      comment: undefined
    },
    'should contain only a date and a description'
  );

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 (#443) description\n`).cstJournal.children
  );
  t.is(
    result3.length,
    1,
    'should modify a transaction init line with a cheque number'
  );
  t.is(result3[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result3[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: undefined,
      chequeNumber: '#443',
      status: 'unmarked',
      description: 'description',
      contentLines: [],
      comment: undefined
    },
    'should contain only a cheque number and a description'
  );

  const result4 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 * description\n`).cstJournal.children
  );
  t.is(
    result4.length,
    1,
    'should modify a transaction init line with a status indicator'
  );
  t.is(result4[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result4[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: undefined,
      chequeNumber: undefined,
      status: 'cleared',
      description: 'description',
      contentLines: [],
      comment: undefined
    },
    'should contain only a status indicator and a description'
  );

  const result5 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 ; comment\n`).cstJournal.children
  );
  t.is(
    result5.length,
    1,
    'should modify a transaction init line with a comment'
  );
  t.is(result5[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result5[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: undefined,
      chequeNumber: undefined,
      status: 'unmarked',
      description: '',
      contentLines: [],
      comment: { type: 'inlineComment', value: ['comment'] }
    },
    'should contain only a comment and a description'
  );

  const result6 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01=2020/01/02 description\n`).cstJournal.children
  );
  t.is(
    result6.length,
    1,
    'should modify a transaction init line with a posting date'
  );
  t.is(result6[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result6[0] as Raw.Transaction).value,
    {
      date: '1900/01/01',
      postingDate: '2020/01/02',
      chequeNumber: undefined,
      status: 'unmarked',
      description: 'description',
      contentLines: [],
      comment: undefined
    },
    'should contain only a posting date and a description'
  );
});

test('transactionContentLine', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $10\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a transaction posting line');
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.contentLines.length,
    1,
    'should contain a transaction content line'
  );
  t.is(
    (result1[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction content line that is a posting'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    ; inline comment\n`).cstJournal.children
  );
  t.is(result2.length, 1, 'should modify a transaction comment line');
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result2[0] as Raw.Transaction).value.contentLines.length,
    1,
    'should contain a transaction content line'
  );
  t.is(
    (result2[0] as Raw.Transaction).value.contentLines[0].type,
    'inlineComment',
    'should contain a transaction content line that is an inline comment'
  );
});

test('posting', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test\n`).cstJournal.children
  );
  t.is(
    result1.length,
    1,
    'should modify a transaction posting line with only an account name'
  );
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.contentLines.length,
    1,
    'should contain a transaction content line'
  );
  t.is(
    (result1[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction content line that is a posting'
  );
  t.deepEqual(
    (result1[0] as Raw.Transaction).value.contentLines[0].value,
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

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  10\n`).cstJournal.children
  );
  t.is(
    result2.length,
    1,
    'should modify a transaction posting line with an account name and amount'
  );
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result2[0] as Raw.Transaction).value.contentLines.length,
    1,
    'should contain a transaction content line'
  );
  t.is(
    (result2[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction content line that is a posting'
  );
  t.deepEqual(
    (result2[0] as Raw.Transaction).value.contentLines[0].value,
    {
      account: {
        type: 'real',
        name: ['Account', 'Test']
      },
      amount: { commodity: '', value: '10' },
      assertion: undefined,
      comment: undefined,
      lotPrice: undefined,
      status: 'unmarked'
    },
    'should contain a transaction content line with only an account name and amount'
  );

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  10 @ 2USD\n`).cstJournal
      .children
  );
  t.is(
    result3.length,
    1,
    'should modify a transaction posting line with an account name and amount with a lot price'
  );
  t.is(result3[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result3[0] as Raw.Transaction).value.contentLines.length,
    1,
    'should contain a transaction content line'
  );
  t.is(
    (result3[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction content line that is a posting'
  );
  t.deepEqual(
    (result3[0] as Raw.Transaction).value.contentLines[0].value,
    {
      account: {
        type: 'real',
        name: ['Account', 'Test']
      },
      amount: { commodity: '', value: '10' },
      assertion: undefined,
      comment: undefined,
      lotPrice: {
        lotPriceType: 'unit',
        amount: { commodity: 'USD', value: '2' }
      },
      status: 'unmarked'
    },
    'should contain a transaction content line with only an account name and amount with a lot price'
  );

  const result4 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  10 = 10\n`).cstJournal
      .children
  );
  t.is(
    result4.length,
    1,
    'should modify a transaction posting line with an account name and amount with a balance assertion'
  );
  t.is(result4[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result4[0] as Raw.Transaction).value.contentLines.length,
    1,
    'should contain a transaction content line'
  );
  t.is(
    (result4[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction content line that is a posting'
  );
  t.deepEqual(
    (result4[0] as Raw.Transaction).value.contentLines[0].value,
    {
      account: {
        type: 'real',
        name: ['Account', 'Test']
      },
      amount: { commodity: '', value: '10' },
      assertion: {
        type: 'normal',
        subaccounts: false,
        amount: { commodity: '', value: '10' }
      },
      comment: undefined,
      lotPrice: undefined,
      status: 'unmarked'
    },
    'should contain a transaction content line with only an account name and amount with a balance assertion'
  );

  const result5 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    ! Account:Test\n`).cstJournal.children
  );
  t.is(
    result5.length,
    1,
    'should modify a transaction posting line with an account name and status indicator'
  );
  t.is(result5[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result5[0] as Raw.Transaction).value.contentLines.length,
    1,
    'should contain a transaction content line'
  );
  t.is(
    (result5[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction content line that is a posting'
  );
  t.deepEqual(
    (result5[0] as Raw.Transaction).value.contentLines[0].value,
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

  const result6 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test ; a comment\n`).cstJournal
      .children
  );
  t.is(
    result6.length,
    1,
    'should modify a transaction posting line with an account name and a comment'
  );
  t.is(result6[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result6[0] as Raw.Transaction).value.contentLines.length,
    1,
    'should contain a transaction content line'
  );
  t.is(
    (result6[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction content line that is a posting'
  );
  t.deepEqual(
    (result6[0] as Raw.Transaction).value.contentLines[0].value,
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

test('transactionDate', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a transaction simple date');
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.date,
    '1900/01/01',
    'should contain a transaction simple date'
  );
  t.falsy(
    (result1[0] as Raw.Transaction).value.postingDate,
    'should not contain a transaction posting date'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01=2020/02/02\n    ; inline comment\n`).cstJournal
      .children
  );
  t.is(
    result2.length,
    1,
    'should modify a transaction with a simple date and a posting date'
  );
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result2[0] as Raw.Transaction).value.date,
    '1900/01/01',
    'should contain a transaction simple date'
  );
  t.is(
    (result2[0] as Raw.Transaction).value.postingDate,
    '2020/02/02',
    'should contain a transaction posting date'
  );
});

test('account', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a "real" transaction posting account');
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result1[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .account,
    {
      type: 'real',
      name: ['Account', 'Test']
    },
    'should contain a transaction posting line with a real account'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    (Account:Test)\n`).cstJournal.children
  );
  t.is(
    result2.length,
    1,
    'should modify a "virtual" transaction posting account'
  );
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result2[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result2[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .account,
    {
      type: 'virtual',
      name: ['Account', 'Test']
    },
    'should contain a transaction posting line with a virtual account'
  );

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    [Account:Test]\n`).cstJournal.children
  );
  t.is(
    result3.length,
    1,
    'should modify a "virtual balanced" transaction posting account'
  );
  t.is(result3[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result3[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result3[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .account,
    {
      type: 'virtualBalanced',
      name: ['Account', 'Test']
    },
    'should contain a transaction posting line with a virtual balanced account'
  );
});

test('amount', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1\n`).cstJournal.children
  );
  t.is(result1.length, 1, 'should modify a transaction posting amount');
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result1[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      commodity: '$',
      value: '1'
    },
    'should contain a transaction posting line with an amount'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  -$1\n`).cstJournal.children
  );
  t.is(
    result2.length,
    1,
    'should modify a transaction posting amount with a dash in front of the commodity'
  );
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result2[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result2[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      commodity: '$',
      value: '-1'
    },
    'should contain a transaction posting line with an amount and a dash in front of the commodity'
  );

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  1\n`).cstJournal.children
  );
  t.is(
    result3.length,
    1,
    'should modify a transaction posting amount with no commodity'
  );
  t.is(result3[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result3[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result3[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .amount,
    {
      commodity: '',
      value: '1'
    },
    'should contain a transaction posting line with an amount and no commodity'
  );
});

test('lotPrice', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1 @ 2CAD\n`).cstJournal
      .children
  );
  t.is(result1.length, 1, 'should modify a transaction posting unit lot price');
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result1[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .lotPrice,
    {
      lotPriceType: 'unit',
      amount: {
        commodity: 'CAD',
        value: '2'
      }
    },
    'should contain a transaction posting line with a unit lot price'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1 @@ 2CAD\n`).cstJournal
      .children
  );
  t.is(
    result2.length,
    1,
    'should modify a transaction posting total lot price'
  );
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result2[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result2[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .lotPrice,
    {
      lotPriceType: 'total',
      amount: {
        commodity: 'CAD',
        value: '2'
      }
    },
    'should contain a transaction posting line with a total lot price'
  );
});

test('assertion', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1 = $2\n`).cstJournal
      .children
  );
  t.is(
    result1.length,
    1,
    'should modify a transaction posting simple balance assertion'
  );
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result1[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .assertion,
    {
      type: 'normal',
      subaccounts: false,
      amount: {
        commodity: '$',
        value: '2'
      }
    },
    'should contain a transaction posting line with a simple balance assertion'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1 == $2\n`).cstJournal
      .children
  );
  t.is(
    result2.length,
    1,
    'should modify a transaction posting strong balance assertion'
  );
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result2[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result2[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .assertion,
    {
      type: 'strong',
      subaccounts: false,
      amount: {
        commodity: '$',
        value: '2'
      }
    },
    'should contain a transaction posting line with a strong balance assertion'
  );

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1 =* $2\n`).cstJournal
      .children
  );
  t.is(
    result3.length,
    1,
    'should modify a transaction posting strong balance assertion with subaccounts'
  );
  t.is(result3[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result3[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result3[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .assertion,
    {
      type: 'normal',
      subaccounts: true,
      amount: {
        commodity: '$',
        value: '2'
      }
    },
    'should contain a transaction posting line with a strong balance assertion with subaccounts'
  );
});

test('statusIndicator', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    Account:Test  $1\n`).cstJournal.children
  );
  t.is(
    result1.length,
    1,
    'should modify a transaction posting with no status indicator'
  );
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result1[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .status,
    'unmarked',
    'should contain a transaction posting line with no status indicator'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    ! Account:Test  $1\n`).cstJournal.children
  );
  t.is(
    result2.length,
    1,
    'should modify a transaction posting with a ! status indicator'
  );
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result2[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result2[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .status,
    'pending',
    'should contain a transaction posting line with a ! status indicator'
  );

  const result3 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01\n    * Account:Test  $1\n`).cstJournal.children
  );
  t.is(
    result3.length,
    1,
    'should modify a transaction posting with a * status indicator'
  );
  t.is(result3[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result3[0] as Raw.Transaction).value.contentLines[0].type,
    'posting',
    'should contain a transaction posting line'
  );
  t.deepEqual(
    ((result3[0] as Raw.Transaction).value.contentLines[0] as Raw.Posting).value
      .status,
    'cleared',
    'should contain a transaction posting line with a * status indicator'
  );
});

test('chequeNumber', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 (#443)\n`).cstJournal.children
  );
  t.is(
    result1.length,
    1,
    'should modify a transaction posting with a cheque number'
  );
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.chequeNumber,
    '#443',
    'should contain a transaction posting line with a cheque number'
  );
});

test('description', (t) => {
  const result1 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 description\n`).cstJournal.children
  );
  t.is(
    result1.length,
    1,
    'should modify a transaction posting with a description'
  );
  t.is(result1[0].type, 'transaction', 'should be a transaction object');
  t.is(
    (result1[0] as Raw.Transaction).value.description,
    'description',
    'should contain a transaction posting line with a description'
  );

  const result2 = CstToRawVisitor.journal(
    parseLedgerToCST(`1900/01/01 payee | memo\n`).cstJournal.children
  );
  t.is(
    result2.length,
    1,
    'should modify a transaction posting with a payee and memo'
  );
  t.is(result2[0].type, 'transaction', 'should be a transaction object');
  t.deepEqual(
    (result2[0] as Raw.Transaction).value.description,
    {
      payee: 'payee',
      memo: 'memo'
    },
    'should contain a transaction posting line with a payee and memo'
  );
});
