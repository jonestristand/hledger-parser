import HLedgerLexer from './lib/lexer';
import HLedgerParser from './lib/parser';
import HLedgerRawVisitor from './lib/visitors/cst_to_raw';
import RawToCookedVisitor from './lib/visitors/raw_to_cooked';

import type { Journal as CookedJournal } from './lib/visitors/cooked_types';
import type { Journal as RawJournal } from './lib/visitors/raw_types';

export function parseLedger(text: string) {
  const lexResult = HLedgerLexer.tokenize(text);

  // setting a new input will RESET the parser instance's state.
  HLedgerParser.input = lexResult.tokens;

  // any top level rule may be used as an entry point
  const cst = HLedgerParser.journal();
  const ast = HLedgerRawVisitor.journal(cst.children);

  return {
    // This is a pure grammar, the value will be undefined until we add embedded actions
    // or enable automatic CST creation.
    ast,
    tokens: lexResult.tokens,
    lexErrors: lexResult.errors,
    parseErrors: HLedgerParser.errors,
  };
}

export function RawToCookedLedger(rawJournal: RawJournal): CookedJournal {
  const visitor = new RawToCookedVisitor();
  return visitor.journal(rawJournal);
}
