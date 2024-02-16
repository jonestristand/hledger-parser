import {
  CustomPatternMatcherFunc,
  CustomPatternMatcherReturn,
  Lexer,
  TokenType
} from 'chevrotain';
import _ from 'lodash';

export const NewlineName = 'NEWLINE';

export function matchOnlyAtStart(regex: RegExp) {
  const matcher: CustomPatternMatcherFunc = (text, offset, tokens) => {
    const prevToken = _.last(tokens);
    if (
      offset === 0 ||
      prevToken?.tokenType.name === NewlineName
    ) {
      regex.lastIndex = offset;
      const match = regex.exec(text);
      if (match) return [match[0]];
    }
    return null;
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

// TODO: Ensure there is Unicode character support for commodity text. Currently, there only
//  appears to be support for it as long as the text is wrapped in double quotes. Might need
//  to verify the validity of Unicode characters in unquoted commodity text.
const commodityTextPattern = '([a-zA-Z\\p{Sc}]+)|"([^";\\r\\n]*)"';
const priceCommodityTextPattern = `(${commodityTextPattern}) +`;

function getCommodityMatchFunc(commodityTextRegex: RegExp): CustomPatternMatcherFunc {
  return (text, offset) => {
    commodityTextRegex.lastIndex = offset;
    const match = commodityTextRegex.exec(text);

    if (match) {
      const result: CustomPatternMatcherReturn = [match[0]];
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      result.payload = (match[1] ?? match[2]).trimEnd();
      return result;
    }

    return null;
  };
}

export const matchCommodityText: CustomPatternMatcherFunc = getCommodityMatchFunc(
  new RegExp(commodityTextPattern, 'uy')
);

export const matchPriceCommodityText: CustomPatternMatcherFunc = getCommodityMatchFunc(
  new RegExp(priceCommodityTextPattern, 'uy')
);

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

export const matchJournalNumber: CustomPatternMatcherFunc = (text, offset) => {
  const captureRegex = /\d[\d,. eE+-]*/y;
  captureRegex.lastIndex = offset;
  const fullMatch = captureRegex.exec(text);

  if (!fullMatch || fullMatch.length === 0) return null;

  let fullMatchText = fullMatch[0].trimEnd();

  // Edge case for commodities starting with 'E' or 'e'
  if (/[eE]+$/g.test(fullMatchText)) fullMatchText = fullMatchText.replace(/[eE]+$/, '');

  if (!(/^\d+(,\d+)*(\.\d*)?([Ee][+-]?\d+)?$/g.test(fullMatchText)
    || /^\d+(\.\d+)*(,\d*)?([Ee][+-]?\d+)?$/g.test(fullMatchText)
    || /^\d+( \d+)*(\.\d*)?([Ee][+-]?\d+)?$/g.test(fullMatchText)
    || /^\d+( \d+)*(,\d*)?([Ee][+-]?\d+)?$/g.test(fullMatchText))) return null;

  return [fullMatchText];
};

export const matchTagColon: CustomPatternMatcherFunc = (text, offset) => {
  const tagColonRegex = /(?<!\s):/y;
  tagColonRegex.lastIndex = offset;
  const match = tagColonRegex.exec(text);

  if (match) {
    return [match[0]];
  }

  return null;
};
