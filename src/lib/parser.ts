import { CstParser } from 'chevrotain';

import { tokenModeDefinitions } from './lexer';
import {
  AccountDirective,
  AMOUNT_WS,
  ASTERISK,
  ASTERISK_AT_START,
  AT,
  CommentText,
  CommodityText,
  DASH,
  DateAtStart,
  EQUALS,
  HASHTAG_AT_START,
  INDENT,
  InlineCommentTagColon,
  InlineCommentTagComma,
  InlineCommentTagName,
  InlineCommentTagValue,
  InlineCommentText,
  JournalDate,
  JournalNumber,
  LPAREN,
  NEWLINE,
  ParenValue,
  PDirective,
  PDirectiveCommodityText,
  PIPE,
  PLUS,
  PostingStatusIndicator,
  RealAccountName,
  RPAREN,
  SEMICOLON_AT_START,
  SemicolonComment,
  Text,
  TxnStatusIndicator,
  VirtualAccountName,
  VirtualBalancedAccountName
} from './lexer/tokens';

class HLedgerParser extends CstParser {
  constructor() {
    super(tokenModeDefinitions);
    this.performSelfAnalysis();
  }

  public lineComment = this.RULE('lineComment', () => {
    this.OR([
      { ALT: () => this.CONSUME(SEMICOLON_AT_START) },
      { ALT: () => this.CONSUME(HASHTAG_AT_START) },
      { ALT: () => this.CONSUME(ASTERISK_AT_START) }
    ]);
    this.OPTION(() => {
      this.CONSUME(CommentText);
    });
    this.CONSUME(NEWLINE);
  });

  public inlineComment = this.RULE('inlineComment', () => {
    this.CONSUME(SemicolonComment);
    this.MANY(() => this.SUBRULE(this.inlineCommentItem));
  });

  public inlineCommentItem = this.RULE('inlineCommentItem', () => {
    this.OR([
      { ALT: () => this.CONSUME(InlineCommentText) },
      { ALT: () => this.SUBRULE(this.tag) }
    ]);
  });

  public tag = this.RULE('tag', () => {
    this.CONSUME(InlineCommentTagName);
    this.CONSUME(InlineCommentTagColon);
    this.OPTION(() => this.CONSUME(InlineCommentTagValue));
    this.OPTION1(() => this.CONSUME(InlineCommentTagComma));
  });

  public journal = this.RULE('journal', () => {
    this.MANY(() => {
      this.SUBRULE(this.journalItem);
    });
  });

  public journalItem = this.RULE('journalItem', () => {
    this.OR([
      { ALT: () => this.SUBRULE(this.transaction) },
      { ALT: () => this.SUBRULE(this.lineComment) },
      { ALT: () => this.SUBRULE(this.priceDirective) },
      { ALT: () => this.SUBRULE(this.accountDirective) },
      { ALT: () => this.CONSUME(NEWLINE) }
    ]);
  });

  public transaction = this.RULE('transaction', () => {
    this.SUBRULE(this.transactionInitLine);
    this.MANY(() => {
      this.SUBRULE(this.transactionContentLine);
    });
  });

  public priceDirective = this.RULE('priceDirective', () => {
    this.CONSUME(PDirective);
    this.CONSUME(JournalDate);
    this.CONSUME(PDirectiveCommodityText);
    this.SUBRULE(this.amount);
    this.CONSUME(NEWLINE); // TODO: There is support for inline comments prior to NEWLINE.
  });

  public accountDirective = this.RULE('accountDirective', () => {
    this.CONSUME(AccountDirective);
    this.CONSUME(RealAccountName);
    this.OPTION(() => {
      this.SUBRULE(this.inlineComment);
    });
    this.CONSUME(NEWLINE);
    this.MANY(() => {
      this.SUBRULE(this.accountDirectiveContentLine);
    });
  });

  public accountDirectiveContentLine = this.RULE(
    'accountDirectiveContentLine',
    () => {
      this.CONSUME(INDENT);
      // this.OR([
      /* { ALT: () =>  */ this.SUBRULE(this.inlineComment); /*  }, */
      // ]);
      this.CONSUME(NEWLINE);
    }
  );

  public transactionInitLine = this.RULE('transactionInitLine', () => {
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
    this.CONSUME(NEWLINE);
  });

  public transactionContentLine = this.RULE('transactionContentLine', () => {
    this.CONSUME(INDENT);
    this.OR([
      { ALT: () => this.SUBRULE(this.posting) },
      { ALT: () => this.SUBRULE(this.inlineComment) }
    ]);
    this.CONSUME(NEWLINE);
  });

  public posting = this.RULE('posting', () => {
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

  public transactionDate = this.RULE('transactionDate', () => {
    this.CONSUME(DateAtStart);
    this.OPTION(() => {
      this.CONSUME(EQUALS);
      this.CONSUME(JournalDate);
    });
  });

  public account = this.RULE('account', () => {
    this.OR([
      { ALT: () => this.CONSUME(RealAccountName) },
      { ALT: () => this.CONSUME(VirtualAccountName) },
      { ALT: () => this.CONSUME(VirtualBalancedAccountName) }
    ]);
  });

  public amount = this.RULE('amount', () => {
    this.OR([
      {
        ALT: () => {
          this.OR1([
            { ALT: () => this.CONSUME(DASH) },
            { ALT: () => this.CONSUME(PLUS) }
          ]);
          this.OPTION(() => this.CONSUME(AMOUNT_WS));
          this.OR2([
            {
              ALT: () => {
                this.CONSUME(CommodityText);
                this.OPTION1(() => this.CONSUME1(AMOUNT_WS));
                this.CONSUME(JournalNumber);
              }
            },
            {
              ALT: () => {
                this.CONSUME1(JournalNumber);
                this.OPTION2(() => {
                  this.OPTION3(() => this.CONSUME2(AMOUNT_WS));
                  this.CONSUME1(CommodityText);
                });
              }
            }
          ]);
        }
      },
      {
        ALT: () => {
          this.CONSUME2(JournalNumber);
          this.OPTION4(() => {
            this.OPTION5(() => this.CONSUME3(AMOUNT_WS));
            this.CONSUME2(CommodityText);
          });
        }
      },
      {
        ALT: () => {
          this.CONSUME3(CommodityText);
          this.OPTION6(() => this.CONSUME4(AMOUNT_WS));
          this.OR3([
            {
              ALT: () => {
                this.CONSUME3(JournalNumber);
              }
            },
            {
              ALT: () => {
                this.OR4([
                  { ALT: () => this.CONSUME1(DASH) },
                  { ALT: () => this.CONSUME1(PLUS) }
                ]);
                this.OPTION7(() => this.CONSUME5(AMOUNT_WS));
                this.CONSUME4(JournalNumber);
              }
            }
          ]);
        }
      },
    ]);
    this.OPTION8(() => this.CONSUME6(AMOUNT_WS));
  });

  public lotPrice = this.RULE('lotPrice', () => {
    this.OR([
      {
        ALT: () => {
          this.CONSUME(LPAREN);
          this.CONSUME(AT);
          this.OPTION(() => this.CONSUME1(AT));
          this.CONSUME(RPAREN);
        }
      },
      {
        ALT: () => {
          this.CONSUME2(AT);
          this.OPTION1(() => this.CONSUME3(AT));
        }
      }
    ]);
    this.CONSUME(AMOUNT_WS);
    this.SUBRULE(this.amount);
  });

  public assertion = this.RULE('assertion', () => {
    this.CONSUME(EQUALS);
    this.OPTION(() => {
      this.CONSUME1(EQUALS);
    });
    this.OPTION1(() => {
      this.CONSUME(ASTERISK);
    });
    this.CONSUME(AMOUNT_WS);
    this.SUBRULE(this.amount);
  });

  public statusIndicator = this.RULE('statusIndicator', () => {
    this.OR([
      { ALT: () => this.CONSUME(PostingStatusIndicator) },
      { ALT: () => this.CONSUME(TxnStatusIndicator) }
    ]);
  });

  public chequeNumber = this.RULE('chequeNumber', () => {
    this.CONSUME(ParenValue);
  });

  public description = this.RULE('description', () => {
    this.CONSUME(Text);
    this.OPTION(() => {
      this.CONSUME(PIPE);
      this.CONSUME1(Text);
    });
  });
}

const ParserInstance = new HLedgerParser();

// TODO: Make this in dev mode only
export const productions = ParserInstance.getGAstProductions();
export const serializedProductions =
  ParserInstance.getSerializedGastProductions();

export default ParserInstance;
