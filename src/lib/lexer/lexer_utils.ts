import {
  CustomPatternMatcherFunc,
  CustomPatternMatcherReturn,
  Lexer,
  TokenType
} from 'chevrotain';
import _ from 'lodash';

import BasicTokens from './tokens_basic';

export function matchOnlyAtStart(regex: RegExp) {
  const matcher: CustomPatternMatcherFunc = (text, offset, tokens) => {
    const prevToken = _.last(tokens);
    if (
      offset === 0 ||
      prevToken?.tokenType.name === BasicTokens.NEWLINE.name
    ) {
      regex.lastIndex = offset;
      const match = regex.exec(text);
      return match ? [match[0]] : null;
    } else {
      return null;
    }
  };

  return matcher;
}

const parenValueRegex = /\(([^)\n\r]*)\)/y;
export const matchParenValue: CustomPatternMatcherFunc = (text, offset) => {
  parenValueRegex.lastIndex = offset;
  const match = parenValueRegex.exec(text);

  if (match) {
    const result: CustomPatternMatcherReturn = [match[0]];
    result.payload = match[1];
    return result;
  }

  return null;
};

const commodityTextRegex = /([a-zA-Z\p{Sc}]+)|"([^";\r\n]*)"/uy;
export const matchCommodityText: CustomPatternMatcherFunc = (text, offset) => {
  commodityTextRegex.lastIndex = offset;
  const match = commodityTextRegex.exec(text);

  if (match) {
    const result: CustomPatternMatcherReturn = [match[0]];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    result.payload = match[1] ?? match[2];
    return result;
  }

  return null;
};

export function matchAccountName(delimiter?: '(' | '[') {
  const s = delimiter ?? '(';
  const e = delimiter === '[' ? ']' : ')';
  const DelimitedAccountNameRegex = new RegExp(
    `\\${s}(?!.*[ \\t]{2,}.*\\${e})([^;\\r\\n]*)\\${e}(?=[ \\t]{2,}|[\\r\\n])`,
    'y'
  );
  const NormalAccountNameRegex = /(.+?)(?=[\t ]{2,}|[\t ]{1,};|[\r\n])/y;
  const Regex = delimiter ? DelimitedAccountNameRegex : NormalAccountNameRegex;

  const matcher: CustomPatternMatcherFunc = (text, offset) => {
    Regex.lastIndex = offset;
    const match = Regex.exec(text);
    const result: CustomPatternMatcherReturn | null = match ? [match[0]] : null;

    const acctNameMatch = match?.[1];
    if (acctNameMatch && result) {
      result.payload = acctNameMatch.split(':');
    }

    return result;
  };

  return matcher;
}

export function matchOnlyAfter(match: RegExp, after: TokenType[]) {
  const afterTokenNames = after.map((token) => token.name);

  const matcher: CustomPatternMatcherFunc = (text, offset, tokens) => {
    const lastNonWsToken = _.findLast(
      tokens,
      (t) => t.tokenType.GROUP !== Lexer.SKIPPED
    );

    if (
      lastNonWsToken &&
      afterTokenNames.includes(lastNonWsToken.tokenType.name)
    ) {
      match.lastIndex = offset;
      const matchResult = match.exec(text);
      return matchResult ? [matchResult[0]] : null;
    } else {
      return null;
    }
  };

  return matcher;
}
