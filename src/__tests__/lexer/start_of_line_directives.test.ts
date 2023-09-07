import { runLexerTests } from './utils';

const tests = [
  {
    pattern: 'An Account:Test',
    expected: [],
    title: `reject a line starting with anything other than date, indent, ;, #, *, 'account', or 'P'`
  }
];

runLexerTests(tests);
