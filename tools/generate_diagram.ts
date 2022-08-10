import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { createSyntaxDiagramsCode } from 'chevrotain';
import { serializedProductions } from '../src/lib/parser';

const htmlString = createSyntaxDiagramsCode(serializedProductions);
const htmlPath = resolve(__dirname, '..', 'diagram.html');
writeFileSync(htmlPath, htmlString);
