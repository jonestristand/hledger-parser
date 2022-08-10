import { CstParser } from "chevrotain";

import { tokenModeDefinitions } from "./lexer";
import {
  BasicTokens,
  CommentModeTokens,
  DefaultModeTokens,
  PostingModeTokens,
  PriceModeTokens,
  TxnLineModeTokens,
} from "./lexer/tokens";

class HLedgerParser extends CstParser {
  constructor() {
    super(tokenModeDefinitions);
    this.performSelfAnalysis();
  }

  public lineComment = this.RULE("lineComment", () => {
    this.OR([
      { ALT: () => this.CONSUME(CommentModeTokens.SEMICOLON_AT_START) },
      { ALT: () => this.CONSUME(CommentModeTokens.HASHTAG_AT_START) },
      { ALT: () => this.CONSUME(CommentModeTokens.ASTERISK_AT_START) },
    ]);
    this.OPTION(() => {
      this.CONSUME(CommentModeTokens.CommentText);
    });
    this.CONSUME(BasicTokens.NEWLINE);
  });

  public inlineComment = this.RULE("inlineComment", () => {
    this.CONSUME(CommentModeTokens.SemicolonComment);
    this.MANY(() => this.SUBRULE(this.inlineCommentItem));
  });

  public inlineCommentItem = this.RULE("inlineCommentItem", () => {
    this.OR([
      { ALT: () => this.CONSUME(CommentModeTokens.InlineCommentText) },
      { ALT: () => this.SUBRULE(this.tag) },
    ]);
  });

  public tag = this.RULE("tag", () => {
    this.CONSUME(CommentModeTokens.InlineCommentTagName);
    this.CONSUME(CommentModeTokens.InlineCommentTagColon);
    this.OPTION(() => this.CONSUME(CommentModeTokens.InlineCommentTagValue));
    this.OPTION1(() => this.CONSUME(CommentModeTokens.InlineCommentTagComma));
  });

  public journal = this.RULE("journal", () => {
    this.MANY(() => {
      this.SUBRULE(this.journalItem);
    });
  });

  public journalItem = this.RULE("journalItem", () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.transaction) },
      { ALT: () => this.SUBRULE(this.lineComment) },
      { ALT: () => this.SUBRULE(this.priceDirective) },
      { ALT: () => this.SUBRULE(this.accountDirective) },
      { ALT: () => this.CONSUME(BasicTokens.NEWLINE) },
    ]);
  });

  public transaction = this.RULE("transaction", () => {
    this.SUBRULE(this.transactionInitLine);
    this.MANY(() => {
      this.SUBRULE(this.transactionContentLine);
    });
  });

  public priceDirective = this.RULE("priceDirective", () => {
    this.CONSUME(DefaultModeTokens.PDirective);
    this.CONSUME(PriceModeTokens.PDirectiveDate);
    this.CONSUME(PostingModeTokens.CommodityText);
    this.SUBRULE(this.amount);
    this.CONSUME(BasicTokens.NEWLINE);
  });

  public accountDirective = this.RULE("accountDirective", () => {
    this.CONSUME(DefaultModeTokens.AccountDirective);
    this.CONSUME(PostingModeTokens.RealAccountName);
    this.OPTION(() => {
      this.SUBRULE(this.inlineComment);
    });
    this.CONSUME(BasicTokens.NEWLINE);
    this.MANY(() => {
      this.SUBRULE(this.accountDirectiveContentLine);
    });
  });

  public accountDirectiveContentLine = this.RULE(
    "accountDirectiveContentLine",
    () => {
      this.CONSUME(DefaultModeTokens.INDENT);
      // this.OR([
      /* { ALT: () =>  */ this.SUBRULE(this.inlineComment); /*  }, */
      // ]);
      this.CONSUME(BasicTokens.NEWLINE);
    }
  );

  public transactionInitLine = this.RULE("transactionInitLine", () => {
    this.SUBRULE(this.transactionDate);
    this.OPTION(() => {
      this.SUBRULE(this.statusIndicator);
    });
    this.OPTION1(() => {
      this.SUBRULE(this.chequeNumber);
    });
    this.OPTION2(() => {
      this.SUBRULE(this.description);
    });
    this.OPTION3(() => {
      this.SUBRULE(this.inlineComment);
    });
    this.CONSUME(BasicTokens.NEWLINE);
  });

  public transactionContentLine = this.RULE("transactionContentLine", () => {
    this.CONSUME(DefaultModeTokens.INDENT);
    this.OR([
      { ALT: () => this.SUBRULE(this.posting) },
      { ALT: () => this.SUBRULE(this.inlineComment) },
    ]);
    this.CONSUME(BasicTokens.NEWLINE);
  });

  public posting = this.RULE("posting", () => {
    this.OPTION(() => {
      this.SUBRULE(this.statusIndicator);
    });
    this.SUBRULE(this.account);
    this.OPTION1(() => {
      this.SUBRULE(this.amount);
    });
    this.OPTION2(() => {
      this.SUBRULE(this.lotPrice);
    });
    this.OPTION3(() => {
      this.SUBRULE(this.assertion);
    });
    this.OPTION4(() => {
      this.SUBRULE(this.inlineComment);
    });
  });

  public transactionDate = this.RULE("transactionDate", () => {
    //this.SUBRULE(this.simpleDate);
    this.CONSUME(DefaultModeTokens.DateAtStart);
    this.OPTION(() => {
      this.CONSUME(BasicTokens.EQUALS);
      this.CONSUME(BasicTokens.Date);
    });
  });

  public account = this.RULE("account", () => {
    this.OR([
      { ALT: () => this.CONSUME(PostingModeTokens.RealAccountName) },
      { ALT: () => this.CONSUME(PostingModeTokens.VirtualAccountName) },
      { ALT: () => this.CONSUME(PostingModeTokens.VirtualBalancedAccountName) },
    ]);
  });

  public amount = this.RULE("amount", () => {
    this.OR1([
      {
        ALT: () => {
          this.OPTION(() => this.CONSUME(BasicTokens.DASH));
          this.CONSUME(PostingModeTokens.CommodityText);
          this.CONSUME(PostingModeTokens.Number);
        },
      },
      {
        ALT: () => {
          this.CONSUME1(PostingModeTokens.Number);
          this.OPTION1(() => this.CONSUME1(PostingModeTokens.CommodityText));
        },
      },
    ]);
  });

  public lotPrice = this.RULE("lotPrice", () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(BasicTokens.LPAREN);
          this.CONSUME(BasicTokens.AT);
          this.OPTION(() => this.CONSUME1(BasicTokens.AT));
          this.CONSUME(BasicTokens.RPAREN);
        },
      },
      {
        ALT: () => {
          this.CONSUME2(BasicTokens.AT);
          this.OPTION1(() => this.CONSUME3(BasicTokens.AT));
        },
      },
    ]);
    this.SUBRULE(this.amount);
  });

  public assertion = this.RULE("assertion", () => {
    this.CONSUME(BasicTokens.EQUALS);
    this.OPTION(() => {
      this.CONSUME1(BasicTokens.EQUALS);
    });
    this.OPTION1(() => {
      this.CONSUME(BasicTokens.ASTERISK);
    });
    this.SUBRULE(this.amount);
  });

  public statusIndicator = this.RULE("statusIndicator", () => {
    this.OR([
      { ALT: () => this.CONSUME(PostingModeTokens.PostingStatusIndicator) },
      { ALT: () => this.CONSUME(TxnLineModeTokens.TxnStatusIndicator) },
    ]);
  });

  public chequeNumber = this.RULE("chequeNumber", () => {
    this.CONSUME(TxnLineModeTokens.ParenValue);
  });

  public description = this.RULE("description", () => {
    this.CONSUME(TxnLineModeTokens.Text);
    this.OPTION(() => {
      this.CONSUME(BasicTokens.PIPE);
      this.CONSUME1(TxnLineModeTokens.Text);
    });
  });
}

const ParserInstance = new HLedgerParser();

// TODO: Make this in dev mode only
export const productions = ParserInstance.getGAstProductions();
export const serializedProductions =
  ParserInstance.getSerializedGastProductions();

export default ParserInstance;
