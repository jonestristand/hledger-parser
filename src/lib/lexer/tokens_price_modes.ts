import { createToken } from 'chevrotain';

import BasicTokens from './tokens_basic';
import PostingModeTokens from './tokens_posting_modes';

// ====- Simple tokens -====
const PDirectiveDate = createToken({
  name: 'PDirectiveDate',
  pattern: BasicTokens.Date.PATTERN,
  push_mode: 'price_amounts_mode'
});

// ====- Lexing modes -========================================================
export const price_mode = [
  BasicTokens.SINGLE_WS,
  BasicTokens.NEWLINE,
  PDirectiveDate,
  BasicTokens.DASH
];

export const price_amounts_mode = [
  BasicTokens.SINGLE_WS,
  BasicTokens.NEWLINE,
  PostingModeTokens.Number,
  PostingModeTokens.CommodityText,
  BasicTokens.DASH
];

// ====- Token export -========================================================
export default {
  PDirectiveDate
};
