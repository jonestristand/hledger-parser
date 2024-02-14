import test, { ExecutionContext } from 'ava';

import { CSTParseReturn, parseLedgerToCST } from '../../index';
import CstToRawVisitor from '../../lib/visitors/cst_to_raw';
import * as Raw from '../../lib/visitors/raw_types';
import { assertNoLexingOrParsingErrors } from '../utils';

function assertIsValidDefaultCommodityDirectiveObject(t: ExecutionContext, result: Raw.Journal) {
  t.is(result.length, 1, 'should contain a single journal item');
  t.is(
    result[0].type,
    'defaultCommodityDirective',
    'should be a default commodity directive object'
  );
}

function getDefaultCommodityDirectiveObject(t: ExecutionContext, cstResult: CSTParseReturn): Raw.DefaultCommodityDirective {
  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidDefaultCommodityDirectiveObject(t, result);

  return result[0] as Raw.DefaultCommodityDirective;
}

test('returns a default commodity directive object', (t) => {
  const cstResult = parseLedgerToCST(`D CAD1000.00\n`);

  const defaultCommodityDirectiveObject = getDefaultCommodityDirectiveObject(t, cstResult);

  t.truthy(defaultCommodityDirectiveObject.value.format, 'should contain inline commodity format');

  t.is(
    defaultCommodityDirectiveObject.value.format.value,
    'CAD1000.00',
    'should contain a representation of the commodity amount format'
  );

  t.is(
    defaultCommodityDirectiveObject.value.format.commodity,
    'CAD',
    'should contain the commodity text'
  );

  t.is(
    defaultCommodityDirectiveObject.value.format.number,
    '1000.00',
    'should contain the numeric format'
  );
});

test('returns a default commodity directive object with a subdirective comment', (t) => {
  const cstResult = parseLedgerToCST(`D CAD1000.00
    ; comment
`);

  const defaultCommodityDirectiveObject = getDefaultCommodityDirectiveObject(t, cstResult);

  t.is(
    defaultCommodityDirectiveObject.value.contentLines.length,
    1,
    'should contain a single content line'
  );

  const inlineComment = defaultCommodityDirectiveObject.value.contentLines[0].value.inlineComment;

  t.truthy(
    inlineComment,
    'should contain a subdirective comment'
  );

  t.is(
    inlineComment.value[0],
    'comment',
    'subdirective comment should contain correct text'
  );
});

test('returns a default commodity directive object with inline comment', (t) => {
  const cstResult = parseLedgerToCST(`D CAD1000.00 ; comment\n`);

  const defaultCommodityDirectiveObject = getDefaultCommodityDirectiveObject(t, cstResult);

  t.truthy(
    defaultCommodityDirectiveObject.value.comments,
    'should contain an inline comment'
  );

  t.is(
    defaultCommodityDirectiveObject.value.comments?.value[0],
    'comment',
    'inline comment should contain the correct value'
  );
});
