import { Lexer } from 'chevrotain';

import {
  account_mode,
  comment_mode,
  commodity_mode,
  default_mode,
  format_mode,
  indent_mode,
  inline_comment_mode,
  inline_comment_tag_mode,
  memo_mode,
  posting_amount_mode,
  posting_mode,
  price_amounts_mode,
  price_mode,
  txn_line_mode
} from './modes';

export const tokenModeDefinitions = {
  modes: {
    account_mode,
    txn_line_mode,
    comment_mode,
    commodity_mode,
    indent_mode,
    inline_comment_mode,
    inline_comment_tag_mode,
    posting_mode,
    posting_amount_mode,
    format_mode,
    price_mode,
    price_amounts_mode,
    memo_mode,
    default_mode
  },
  defaultMode: 'default_mode'
};

export default new Lexer(tokenModeDefinitions, { recoveryEnabled: false });
