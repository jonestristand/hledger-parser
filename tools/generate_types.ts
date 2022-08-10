import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { generateCstDts } from 'chevrotain';
import { productions } from '../src/lib/parser';

const dtsString = generateCstDts(productions);
const dtsPath = resolve(__dirname, '../src/lib', 'hledger_cst.ts');
writeFileSync(dtsPath, dtsString);
