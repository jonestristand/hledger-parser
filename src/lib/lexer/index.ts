import { Lexer } from 'chevrotain';

import { account_mode } from './tokens_account_modes';
import {
  comment_mode,
  inline_comment_mode,
  inline_comment_tag_mode,
} from './tokens_comment_modes';
import { default_mode } from './tokens_default_mode';
import { posting_amount_mode, posting_mode } from './tokens_posting_modes';
import { price_amounts_mode, price_mode } from './tokens_price_modes';
import { txn_line_mode } from './tokens_txn_line_modes';

export const tokenModeDefinitions = {
  modes: {
    account_mode,
    txn_line_mode,
    comment_mode,
    inline_comment_mode,
    inline_comment_tag_mode,
    posting_mode,
    posting_amount_mode,
    price_mode,
    price_amounts_mode,
    default_mode,
  },
  defaultMode: 'default_mode',
};

export default new Lexer(tokenModeDefinitions);
