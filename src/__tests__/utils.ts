import {
  createTokenInstance,
  CstElement,
  ILexingResult,
  IToken,
  TokenType
} from 'chevrotain';
import _ from 'lodash';

import { notEmpty } from '../lib/type_utils';

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
