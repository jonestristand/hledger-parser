import test, { ExecutionContext } from 'ava';

import { CSTParseReturn, parseLedgerToCST } from '../../index';
import * as Raw from '../../lib/visitors/raw_types';
import { getCommodityDirectiveObject } from '../utils';


function getCommodityDirectiveContentLines(t: ExecutionContext, cstResult: CSTParseReturn): Raw.CommodityDirectiveContentLine[] {
  const commodityDirectiveObject = getCommodityDirectiveObject(t, cstResult);

  t.truthy(
    commodityDirectiveObject.value.contentLines.length > 0,
    'test must contain commodity directive content lines'
  );

  return commodityDirectiveObject.value.contentLines;
}

test('returns a commodity directive content line containing a subdirective comment', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD1000.00
    ; comment
`);

  const contentLine = getCommodityDirectiveContentLines(t, cstResult)[0];

  t.truthy(
    contentLine.value.inlineComment,
    'should contain an inline comment'
  );

  t.falsy(
    contentLine.value.formatSubdirective,
    'should not contain a format subdirective'
  );

  t.is(
    contentLine.value.inlineComment?.value[0],
    'comment',
    'inline comment should contain the correct value'
  );
});

test('returns a commodity directive content line containing a format subdirective', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD
    format CAD1000.00
`);

  const contentLine = getCommodityDirectiveContentLines(t, cstResult)[0];

  t.truthy(
    contentLine.value.formatSubdirective,
    'should contain a fomrat subdirective'
  );

  t.falsy(
    contentLine.value.inlineComment,
    'should not contain an inline comment'
  );

  t.is(
    contentLine.value.formatSubdirective?.value.format.value,
    'CAD1000.00',
    'format subdirective should contain the correct value'
  );
});

test('returns a commodity directive content line containing a format subdirective with inline comment', (t) => {
  const cstResult = parseLedgerToCST(`commodity CAD
    format CAD1000.00 ; inline comment
`);

  const contentLine = getCommodityDirectiveContentLines(t, cstResult)[0];

  t.truthy(
    contentLine.value.formatSubdirective,
    'should contain a fomrat subdirective'
  );

  t.truthy(
    contentLine.value.inlineComment,
    'should contain an inline comment'
  );

  t.is(
    contentLine.value.formatSubdirective?.value.format.value,
    'CAD1000.00 ',
    'format subdirective should contain the correct value'
  );

  t.is(
    contentLine.value.inlineComment?.value[0],
    'inline comment',
    'inline comment should contain the correct value'
  );
});
