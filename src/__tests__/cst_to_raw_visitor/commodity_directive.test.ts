import test from 'ava';

import { parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import { assertNoLexingOrParsingErrors, getCommodityDirectiveObject } from '../utils';

test('returns a commodity directive object', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD1000.00\n`);

  const commodityDirectiveObject = getCommodityDirectiveObject(t, cstResult);

  t.truthy(commodityDirectiveObject.value.format, 'should contain inline commodity format');

  t.is(
    commodityDirectiveObject.value.format?.value,
    'CAD1000.00',
    'should contain a representation of the commodity amount format'
  );

  t.is(
    commodityDirectiveObject.value.format?.commodity,
    'CAD',
    'should contain the commodity text'
  );

  t.is(
    commodityDirectiveObject.value.format?.number,
    '1000.00',
    'should contain the numeric format'
  );
});

test('returns a commodity directive object with inline comment', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD1000.00 ; comment\n`);

  const commodityDirectiveObject = getCommodityDirectiveObject(t, cstResult);

  t.truthy(
    commodityDirectiveObject.value.comments,
    'should contain an inline comment'
  );

  t.is(
    commodityDirectiveObject.value.comments?.value[0],
    'comment',
    'inline comment should contain the correct value'
  );
});

test('returns a commodity directive object with format subdirective', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD
    format CAD1000.00
`);

  const commodityDirectiveObject = getCommodityDirectiveObject(t, cstResult);

  t.is(
    commodityDirectiveObject.value.commodity,
    'CAD',
    'should contain commodity text'
  );

  t.is(
    commodityDirectiveObject.value.contentLines.length,
    1,
    'should contain a single content line'
  );

  const formatSubdirective = commodityDirectiveObject.value.contentLines[0].value.formatSubdirective;

  t.truthy(
    formatSubdirective,
    'should contain a format subdirective'
  );

  t.is(
    formatSubdirective?.value.format.value,
    'CAD1000.00',
    'should contain a commodity amount format in format subdirective'
  );

  t.is(
    formatSubdirective?.value.format.number,
    '1000.00',
    'should contain the correct number in format subdirective'
  );

  t.is(
    formatSubdirective?.value.format.commodity,
    'CAD',
    'should contain the correct commodity text in format subdirective'
  );
});

test('does not return a commodity directive object if both inline format and format subdirective present', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD1000.00
    format CAD1000.00
`);

  assertNoLexingOrParsingErrors(t, cstResult);

  t.throws(
    () => {
      CstToRawVisitor.journal(
        cstResult.cstJournal.children
      );
    },
    {
      message: 'Format subdirective is invalid if inline commodity directive format exists'
    },
    'should throw an error if format subdirective and inline commodity format present'
  );
});

test('does not return commodity directive object if inline and subdirective commodity text differ', (t) => {
  const cstResult = parseLedgerToCST(`commodity USD
    format CAD1000.00
`);

  assertNoLexingOrParsingErrors(t, cstResult);

  t.throws(
    () => {
      CstToRawVisitor.journal(
        cstResult.cstJournal.children
      );
    },
    {
      message: 'The commodity text of the directive and format subdirective must match'
    },
    'should throw an error if the commodity text in directive and subdirective differ'
  );
});

test('returns a commodity directive object with a subdirective comment', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD1000.00
    ; comment
`);

  const commodityDirectiveObject = getCommodityDirectiveObject(t, cstResult);

  t.is(
    commodityDirectiveObject.value.contentLines.length,
    1,
    'should contain a single content line'
  );

  const inlineComment = commodityDirectiveObject.value.contentLines[0].value.inlineComment;

  t.truthy(
    inlineComment,
    'should contain a subdirective comment'
  );

  t.is(
    inlineComment?.value[0],
    'comment',
    'subdirective comment should contain correct text'
  );
});

test('returns a commodity directive object with format subdirective and subdirective comments', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD
    format CAD1000.00
    ; comment
`);

  const commodityDirectiveObject = getCommodityDirectiveObject(t, cstResult);

  t.is(
    commodityDirectiveObject.value.contentLines.length,
    2,
    'should contain 2 commodity directive content lines'
  );

  const inlineComment = commodityDirectiveObject.value.contentLines[1].value.inlineComment;
  const formatSubdirective = commodityDirectiveObject.value.contentLines[0].value.formatSubdirective;

  t.truthy(
    inlineComment,
    'should contain a subdirective comment'
  );

  t.truthy(
    formatSubdirective,
    'should contain a format subdirective'
  );

  t.is(
    inlineComment?.value[0],
    'comment',
    'subdirective comment should contain correct text'
  );

  t.is(
    formatSubdirective?.value.format.value,
    'CAD1000.00',
    'format subdirective should contain the correct value'
  );
});

test('returns a commodity directive object with multiple subdirective comments', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD1000.00
    ; comment
    ; another comment
`);

  const commodityDirectiveObject = getCommodityDirectiveObject(t, cstResult);

  t.is(
    commodityDirectiveObject.value.contentLines.length,
    2,
    'should contain 2 commodity directive content lines'
  );

  const inlineComment0 = commodityDirectiveObject.value.contentLines[0].value.inlineComment;
  const inlineComment1 = commodityDirectiveObject.value.contentLines[1].value.inlineComment;

  t.truthy(
    inlineComment0,
    'should contain a first subdirective comment'
  );

  t.truthy(
    inlineComment1,
    'should contain a second subdirective comment'
  );

  t.is(
    inlineComment0?.value[0],
    'comment',
    'first subdirective comment should contain correct text'
  );

  t.is(
    inlineComment1?.value[0],
    'another comment',
    'second subdirective comment should contain correct text'
  );
});

test('returns a commodity directive object with multiple subdirective comments and a single format subdirective', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD
    ; comment
    ; another comment
    format CAD1000.00
`);

  const commodityDirectiveObject = getCommodityDirectiveObject(t, cstResult);

  t.is(
    commodityDirectiveObject.value.contentLines.length,
    3,
    'should contain 3 commodity directive content lines'
  );

  const inlineComment0 = commodityDirectiveObject.value.contentLines[0].value.inlineComment;
  const inlineComment1 = commodityDirectiveObject.value.contentLines[1].value.inlineComment;
  const formatSubdirective = commodityDirectiveObject.value.contentLines[2].value.formatSubdirective;

  t.truthy(
    inlineComment0,
    'should contain a first subdirective comment'
  );

  t.truthy(
    inlineComment1,
    'should contain a second subdirective comment'
  );

  t.is(
    inlineComment0?.value[0],
    'comment',
    'first subdirective comment should contain correct text'
  );

  t.is(
    inlineComment1?.value[0],
    'another comment',
    'second subdirective comment should contain correct text'
  );

  t.truthy(
    formatSubdirective,
    'should contain a format subdirective'
  );

  t.is(
    formatSubdirective?.value.format.value,
    'CAD1000.00',
    'format subdirective should contain the correct value'
  );
});

test('does not return a commodity directive object with multiple format subdirectives', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD
    format CAD1000.00
    format CAD1000.00
`);

  assertNoLexingOrParsingErrors(t, cstResult);

  t.throws(
    () => {
      CstToRawVisitor.journal(
        cstResult.cstJournal.children
      );
    },
    {
      message: 'Only one format subdirective can be defined in the commodity directive'
    },
    'should throw an error if there are multiple format subdirectives'
  );
});

test('returns a commodity directive object with order preserved content lines', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD
    ; comment begin
    format CAD1000.00
    ; comment end
`);

  const commodityDirectiveObject = getCommodityDirectiveObject(t, cstResult);

  t.is(
    commodityDirectiveObject.value.contentLines.length,
    3,
    'should contain 3 commodity directive content lines'
  );

  const contentLineValue0 = commodityDirectiveObject.value.contentLines[0].value;
  const contentLineValue1 = commodityDirectiveObject.value.contentLines[1].value;
  const contentLineValue2 = commodityDirectiveObject.value.contentLines[2].value;

  t.truthy(
    contentLineValue0.inlineComment,
    'first content line should be an inline comment'
  );

  t.is(
    contentLineValue0.inlineComment?.value[0],
    'comment begin',
    'first comment should contain the correct text'
  );

  t.truthy(
    contentLineValue1.formatSubdirective,
    'second content line should be a format subdirective'
  );

  t.truthy(
    contentLineValue2.inlineComment,
    'third content line should be an inline comment'
  );

  t.is(
    contentLineValue2.inlineComment?.value[0],
    'comment end',
    'second comment should contain the correct text'
  );
});

test('returns a commodity directive object with a format subdirective containing an inline comment', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD
    format CAD1000.00 ; comment
`);

  const commodityDirectiveObject = getCommodityDirectiveObject(t, cstResult);

  t.is(
    commodityDirectiveObject.value.contentLines.length,
    1,
    'should contain a single content line'
  );

  const contentLineValue = commodityDirectiveObject.value.contentLines[0].value;
  const formatSubdirective = contentLineValue.formatSubdirective;
  const inlineComment = contentLineValue.inlineComment;

  t.truthy(
    formatSubdirective,
    'content line should contain a format subdirective'
  );

  t.truthy(
    inlineComment,
    'content line should contain an inline comment'
  );
});
