import HLedgerLexer from './lib/lexer';
import HLedgerParser from './lib/parser';
import HLedgerRawVisitor from './lib/visitors/cst_to_raw';
import RawToCookedVisitor from './lib/visitors/raw_to_cooked';

import type * as Cooked from './lib/visitors/cooked_types';
import type * as Raw from './lib/visitors/raw_types';
import type { CstNode, ILexingError, IRecognitionException } from 'chevrotain';

export * as Cooked from './lib/visitors/cooked_types';
export * as Raw from './lib/visitors/raw_types';
export * as Core from './lib/types';

export interface ParseReturn {
  /** An array list of all encountered lexer errors */
  lexErrors: ILexingError[];

  /** An array list of all encountered parsing errors */
  parseErrors: IRecognitionException[];
}

/**
 * Return type interface for the parseLedgerToCST method.
 */
export interface CSTParseReturn extends ParseReturn {
  /** [Chevrotain](https://chevrotain.io/) CstNode tree representing the parsed ledger */
  cstJournal: CstNode;
}

/**
 * Return type interface for the parseLedgerToRaw method.
 */
export interface RawParseReturn extends ParseReturn {
  /** A list of {@link Raw!}.{@link Raw!JournalItem}s constituting a parsed hledger journal,
   * in the order that the items were encountered in the source file */
  rawJournal: Raw.Journal;
}

/**
 * Return type interface for the parseLedgerToRaw method.
 */
export interface CookedParseReturn extends ParseReturn {
  /** A {@link Cooked!}.{@link Cooked!Journal} object constituting a parsed hledger journal
   * with contextual information 'baked in' to the object */
  cookedJournal: Cooked.Journal;
}

/**
 * Scans, lexes, and parses an HLedger journal file into a concrete syntax tree (CST).
 * This method produces a tree of [Chevrotain](https://chevrotain.io/) CST nodes containing
 * the type, position and text image of each parsed node.
 *
 * A 'raw' journal object can be translated into a 'cooked' journal object using the
 * {@link cstToRawLedger} method.
 *
 * ### Example (ESModule)
 * ```js
 * import { parseLedgerToCST } from '@jones.tristand/hledger-parser'
 *
 * const parseResult = parseLedgerToCST(sourceCode)
 * console.log(`Lexing errors: ${parseResult.lexErrors.length}`);
 * console.log(`Parsing errors: ${parseResult.parseErrors.length}`);
 * console.log('Result:', parseResult.cstJournal);
 *
 * // => Lexing errors: 0
 * // => Parsing errors: 0
 * // => Result: {
 * // =>   name: 'journal',
 * // =>   children: [Object: null prototype] { journalItem: [ [Object] ] }
 * // => }
 * ```
 *
 * ### Example (CommonJS)
 * ```js
 * const { parseLedgerToCST } = require('@jones.tristand/hledger-parser');
 *
 * const parseResult = parseLedgerToCST(sourceCode)
 * console.log(`Lexing errors: ${parseResult.lexErrors.length}`);
 * console.log(`Parsing errors: ${parseResult.parseErrors.length}`);
 * console.log('Result:', parseResult.cstJournal);
 *
 * // => Lexing errors: 0
 * // => Parsing errors: 0
 * // => Result: {
 * // =>   name: 'journal',
 * // =>   children: [Object: null prototype] { journalItem: [ [Object] ] }
 * // => }
 * ```
 *
 * @param source the source code of the journal to parse
 */
export function parseLedgerToCST(source: string): CSTParseReturn {
  // Scan and tokenize the source code
  const lexResult = HLedgerLexer.tokenize(source);

  // setting a new input will RESET the parser instance's state.
  HLedgerParser.input = lexResult.tokens;

  const cstResult = HLedgerParser.journal();

  return {
    cstJournal: cstResult,
    lexErrors: lexResult.errors,
    parseErrors: HLedgerParser.errors
  };
}

/**
 * Scans, lexes, and parses an HLedger journal file into a 'raw' journal object format.
 * This method produces an ordered list of {@link Raw!}.{@link Raw!JournalItem}s that
 * represents the provided ledger journal source. Order is preserved in the raw format
 * so that information such as default account or year directives can be preserved.
 *
 * A 'raw' journal object can be translated into a 'cooked' journal object using the
 * {@link rawToCookedLedger} method.
 *
 * ### Example (ESModule)
 * ```js
 * import { parseLedgerToRaw } from '@jones.tristand/hledger-parser'
 *
 * const parseResult = parseLedgerToRaw(sourceCode)
 * console.log(`Lexing errors: ${parseResult.lexErrors.length}`);
 * console.log(`Parsing errors: ${parseResult.parseErrors.length}`);
 * console.log('Result:', parseResult.rawJournal);
 *
 * // => Lexing errors: 0
 * // => Parsing errors: 0
 * // => Result: [
 * // =>   {
 * // =>     type: 'transaction',
 * // =>     value: {
 * // =>       date: '2020/01/01',
 * // =>       description: 'Transaction',
 * // =>       status: 'unmarked',
 * // =>       contentLines: [Array]
 * // =>     }
 * // =>   }
 * // => ]
 * ```
 *
 * ### Example (CommonJS)
 * ```js
 * const { parseLedgerToRaw } = require('@jones.tristand/hledger-parser');
 *
 * const parseResult = parseLedgerToRaw(sourceCode)
 * console.log(`Lexing errors: ${parseResult.lexErrors.length}`);
 * console.log(`Parsing errors: ${parseResult.parseErrors.length}`);
 * console.log('Result:', parseResult.rawJournal);
 *
 * // => Lexing errors: 0
 * // => Parsing errors: 0
 * // => Result: [
 * // =>   {
 * // =>     type: 'transaction',
 * // =>     value: {
 * // =>       date: '2020/01/01',
 * // =>       description: 'Transaction',
 * // =>       status: 'unmarked',
 * // =>       contentLines: [Array]
 * // =>     }
 * // =>   }
 * // => ]
 * ```
 *
 * @param source the source code of the journal to parse
 */
export function parseLedgerToRaw(source: string): RawParseReturn {
  const { cstJournal, lexErrors, parseErrors } = parseLedgerToCST(source);
  const rawJournal = HLedgerRawVisitor.journal(cstJournal.children);

  return {
    rawJournal,
    lexErrors,
    parseErrors
  };
}

/**
 * Scans, lexes, and parses an HLedger journal file into a 'cooked' journal object format.
 * This method produces a {@link Cooked!}.{@link Cooked!Journal} object containing the
 * data from the journal source code in an organized format. All contextual information is
 * 'baked in' to the data structure - e.g. inferred date years are expanded, default account
 * names are inserted, etc.
 *
 * ### Example (ESModule)
 * ```js
 * import { parseLedgerToCooked } from '@jones.tristand/hledger-parser'
 *
 * const parseResult = parseLedgerToCooked(sourceCode)
 * console.log(`Lexing errors: ${parseResult.lexErrors.length}`);
 * console.log(`Parsing errors: ${parseResult.parseErrors.length}`);
 * console.log('Result:', parseResult.cookedJournal);
 *
 * // => Lexing errors: 0
 * // => Parsing errors: 0
 * // => Result: {
 * // =>   transactions: [
 * // =>     {
 * // =>       date: [Object],
 * // =>       status: 'unmarked',
 * // =>       description: 'Transaction',
 * // =>       postings: [Array],
 * // =>       tags: []
 * // =>     }
 * // =>   ],
 * // =>   accounts: [],
 * // =>   prices: []
 * // => }
 * ```
 *
 * ### Example (CommonJS)
 * ```js
 * const { parseLedgerToCooked } = require('@jones.tristand/hledger-parser');
 *
 * const parseResult = parseLedgerToRaw(sourceCode)
 * console.log(`Lexing errors: ${parseResult.lexErrors.length}`);
 * console.log(`Parsing errors: ${parseResult.parseErrors.length}`);
 * console.log('Result:', parseResult.cookedJournal);
 *
 * // => Lexing errors: 0
 * // => Parsing errors: 0
 * // => Result: {
 * // =>   transactions: [
 * // =>     {
 * // =>       date: [Object],
 * // =>       status: 'unmarked',
 * // =>       description: 'Transaction',
 * // =>       postings: [Array],
 * // =>       tags: []
 * // =>     }
 * // =>   ],
 * // =>   accounts: [],
 * // =>   prices: []
 * // => }
 * ```
 *
 * @param source the source code of the journal to parse
 */
export function parseLedgerToCooked(source: string): CookedParseReturn {
  const { rawJournal, lexErrors, parseErrors } = parseLedgerToRaw(source);
  const cookedJournal = RawToCookedVisitor.journal(rawJournal);

  return {
    cookedJournal,
    lexErrors,
    parseErrors
  };
}

/**
 * Converts a 'raw' parsed journal object into a 'cooked' one. Expands
 * default years, accounts, contextual information, etc.
 * @param rawJournal raw journal to convert
 */
export function rawToCookedLedger(rawJournal: Raw.Journal): Cooked.Journal {
  return RawToCookedVisitor.journal(rawJournal);
}

/**
 * Converts a [Chevrotain](https://chevrotain.io/) concrete syntax tree (CST) into
 * a raw journal object.
 * @param cstJournal concrete syntax tree to convert
 */
export function cstToRawLedger(cstJournal: CstNode): Raw.Journal {
  return HLedgerRawVisitor.journal(cstJournal.children);
}
