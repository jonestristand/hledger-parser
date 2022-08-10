import BasicTokens from './tokens_basic';
import CommentModeTokens from './tokens_comment_modes';
import PostingModeTokens from './tokens_posting_modes';

// ====- Simple tokens -====

// ====- Lexing modes -========================================================
export const account_mode = [
  BasicTokens.NEWLINE,
  BasicTokens.SINGLE_WS,
  CommentModeTokens.SemicolonComment,
  PostingModeTokens.RealAccountName
];

// ====- Token export -========================================================
export default {};
