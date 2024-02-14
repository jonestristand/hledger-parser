import { ExecutionContext } from 'ava';
import {
  createTokenInstance,
  CstElement,
  ILexingResult,
  IToken,
  TokenType
} from 'chevrotain';
import _ from 'lodash';

import { CSTParseReturn, ParseReturn } from '../index';
import { notEmpty } from '../lib/type_utils';
import CstToRawVisitor from '../lib/visitors/cst_to_raw';
import * as Raw from '../lib/visitors/raw_types';

import type { CstNode } from 'chevrotain';

export class MockLexer {
  private _tokenList: IToken[] = [];
  private _currLocation = 0;

  reset() {
    this._currLocation = 0;
    this._tokenList = [];
  }

  addToken(type: TokenType, text: string) {
    this._tokenList.push(
      createTokenInstance(
        type,
        text,
        this._currLocation,
        this._currLocation + text.length,
        1,
        1,
        this._currLocation,
        this._currLocation + text.length
      )
    );

    return this;
  }

  tokenize(): IToken[] {
    const returnVal = [...this._tokenList];
    this.reset();
    return returnVal;
  }
}

type simpleCst = Record<string, number | simpleCst[]>;

export function simplifyCst(node: CstNode | undefined): simpleCst | undefined {
  if (!node) return;
  const children = _.mapValues(node.children, (val) => {
    if (val.length > 0 && isCstNode(val[0])) {
      // It's a subrule node
      return (val as CstNode[])
        .map((node) => simplifyCst(node))
        .filter(notEmpty);
    } else {
      // It's a consumed token
      return val.length;
    }
  });

  return children;
}

function isCstNode(testNode: CstElement): testNode is CstNode {
  return !!(testNode as CstNode).name;
}

type simpleLex = string | Record<string, unknown>;

export function simplifyLexResult(result: ILexingResult): simpleLex[] {
  return result.tokens.map((t) =>
    t.payload
      ? {
          [t.tokenType.name]: t.payload as unknown
        }
      : t.tokenType.name
  );
}

export function assertNoLexingOrParsingErrors(t: ExecutionContext, result: ParseReturn) {
  t.is(
    result.lexErrors.length,
    0,
    `should not produce lexing errors: ${result.lexErrors.toString()}`
  );

  t.is(
    result.parseErrors.length,
    0,
    `should not produce parsing errors: ${result.parseErrors.toString()}`
  );
}

export function assertIsValidCommodityDirectiveObject(t: ExecutionContext, result: Raw.Journal) {
  t.is(result.length, 1, 'should contain a single journal item');
  t.is(result[0].type, 'commodityDirective', 'should be a commodity directive object');
}

export function getCommodityDirectiveObject(t: ExecutionContext, cstResult: CSTParseReturn): Raw.CommodityDirective {
  assertNoLexingOrParsingErrors(t, cstResult);

  const result = CstToRawVisitor.journal(
    cstResult.cstJournal.children
  );

  assertIsValidCommodityDirectiveObject(t, result);

  return result[0] as Raw.CommodityDirective;
}
