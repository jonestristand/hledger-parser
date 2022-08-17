import test from 'ava';

import {
  BasicTokens,
  CommentModeTokens,
  DefaultModeTokens,
  PostingModeTokens,
  PriceModeTokens,
  TxnLineModeTokens
} from '../lib/lexer/tokens';
import HLedgerParser from '../lib/parser';

import * as utils from './utils';

test('lineComment', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(CommentModeTokens.SEMICOLON_AT_START, ';')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.lineComment()),
    {
      SEMICOLON_AT_START: 1,
      NEWLINE: 1
    },
    '<lineComment> ;\\n'
  );

  lexer
    .addToken(CommentModeTokens.HASHTAG_AT_START, '#')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.lineComment()),
    {
      HASHTAG_AT_START: 1,
      NEWLINE: 1
    },
    '<lineComment> #\\n'
  );

  lexer
    .addToken(CommentModeTokens.ASTERISK_AT_START, '*')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.lineComment()),
    {
      ASTERISK_AT_START: 1,
      NEWLINE: 1
    },
    '<lineComment> *\\n'
  );

  lexer.addToken(CommentModeTokens.SEMICOLON_AT_START, ';');
  lexer
    .addToken(CommentModeTokens.CommentText, 'a full-line comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.lineComment()),
    {
      SEMICOLON_AT_START: 1,
      CommentText: 1,
      NEWLINE: 1
    },
    '<lineComment> ; a full-line comment\\n'
  );

  lexer.addToken(CommentModeTokens.HASHTAG_AT_START, '#');
  lexer
    .addToken(CommentModeTokens.CommentText, 'a full-line comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.lineComment()),
    {
      HASHTAG_AT_START: 1,
      CommentText: 1,
      NEWLINE: 1
    },
    '<lineComment> # a full-line comment\\n'
  );

  lexer.addToken(CommentModeTokens.ASTERISK_AT_START, '*');
  lexer
    .addToken(CommentModeTokens.CommentText, 'a full-line comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.lineComment()),
    {
      ASTERISK_AT_START: 1,
      CommentText: 1,
      NEWLINE: 1
    },
    '<lineComment> * a full-line comment\\n'
  );

  // === Should not parse ===
  lexer.addToken(CommentModeTokens.SemicolonComment, ';');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(HLedgerParser.lineComment(), '<lineComment!> ;');
});

test('inlineComment', (t) => {
  const lexer = new utils.MockLexer();

  lexer.addToken(CommentModeTokens.SemicolonComment, ';');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.inlineComment()),
    {
      SemicolonComment: 1
    },
    '<inlineComment> ;'
  );

  lexer
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'an inline comment');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.inlineComment()),
    {
      SemicolonComment: 1,
      inlineCommentItem: [
        {
          InlineCommentText: 1
        }
      ]
    },
    '<inlineComment> ; an inline comment'
  );

  lexer
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'an inline comment')
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.inlineComment()),
    {
      SemicolonComment: 1,
      inlineCommentItem: [
        {
          InlineCommentText: 1
        },
        {
          tag: [
            {
              InlineCommentTagName: 1,
              InlineCommentTagColon: 1
            }
          ]
        }
      ]
    },
    '<inlineComment> ; an inline comment'
  );

  // === Should not parse ===
  lexer.addToken(CommentModeTokens.SEMICOLON_AT_START, ';');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(HLedgerParser.inlineComment(), '<inlineComment!> ;');
});

test('inlineCommentItem', (t) => {
  const lexer = new utils.MockLexer();

  lexer.addToken(CommentModeTokens.InlineCommentText, 'an inline comment');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.inlineCommentItem()),
    {
      InlineCommentText: 1
    },
    '<inlineCommentItem> an inline comment'
  );

  lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.inlineCommentItem()),
    {
      tag: [
        {
          InlineCommentTagName: 1,
          InlineCommentTagColon: 1
        }
      ]
    },
    '<inlineCommentItem> tag:'
  );

  // === Should not parse ===
  lexer.addToken(CommentModeTokens.CommentText, 'full-line comment text token');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.inlineCommentItem(),
    '<inlineCommentItem!> full-line comment text token'
  );

  lexer
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'an inline comment');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.inlineCommentItem(),
    '<inlineCommentItem!> ; an inline comment'
  );

  lexer
    .addToken(CommentModeTokens.HASHTAG_AT_START, '#')
    .addToken(CommentModeTokens.CommentText, 'a full-line comment');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.inlineCommentItem(),
    '<inlineCommentItem!> # a full-line comment'
  );

  lexer
    .addToken(CommentModeTokens.ASTERISK_AT_START, '*')
    .addToken(CommentModeTokens.CommentText, 'a full-line comment');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.inlineCommentItem(),
    '<inlineCommentItem!> * a full-line comment'
  );

  lexer
    .addToken(CommentModeTokens.SEMICOLON_AT_START, ';')
    .addToken(CommentModeTokens.CommentText, 'a full-line comment');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.inlineCommentItem(),
    '<inlineCommentItem!> ; a full-line comment'
  );
});

test('tag', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.tag()),
    {
      InlineCommentTagName: 1,
      InlineCommentTagColon: 1
    },
    '<tag> tag:'
  );

  lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':')
    .addToken(CommentModeTokens.InlineCommentTagValue, 'value');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.tag()),
    {
      InlineCommentTagName: 1,
      InlineCommentTagColon: 1,
      InlineCommentTagValue: 1
    },
    '<tag> tag:value'
  );

  lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':')
    .addToken(CommentModeTokens.InlineCommentTagComma, ',');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.tag()),
    {
      InlineCommentTagName: 1,
      InlineCommentTagColon: 1,
      InlineCommentTagComma: 1
    },
    '<tag> tag:,'
  );

  lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagColon, ':')
    .addToken(CommentModeTokens.InlineCommentTagValue, 'value')
    .addToken(CommentModeTokens.InlineCommentTagComma, ',');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.tag()),
    {
      InlineCommentTagName: 1,
      InlineCommentTagColon: 1,
      InlineCommentTagValue: 1,
      InlineCommentTagComma: 1
    },
    '<tag> tag:value,'
  );

  // === Should not parse ===
  lexer.addToken(CommentModeTokens.InlineCommentTagName, 'tag');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(HLedgerParser.journalItem(), '<tag!> tag');

  lexer
    .addToken(CommentModeTokens.InlineCommentTagName, 'tag')
    .addToken(CommentModeTokens.InlineCommentTagValue, 'value');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(HLedgerParser.journalItem(), '<tag!> tag value');
});

test('journal', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.journal()),
    {
      journalItem: [
        {
          transaction: [
            {
              transactionInitLine: [
                {
                  NEWLINE: 1,
                  transactionDate: [
                    {
                      DateAtStart: 1
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    '<journal> 1900/01/01\\n'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.DateAtStart, '1901/02/02')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.journal()),
    {
      journalItem: [
        {
          transaction: [
            {
              transactionInitLine: [
                {
                  NEWLINE: 1,
                  transactionDate: [
                    {
                      DateAtStart: 1
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          transaction: [
            {
              transactionInitLine: [
                {
                  NEWLINE: 1,
                  transactionDate: [
                    {
                      DateAtStart: 1
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    '<journal> 1900/01/01\\n1901/02/02\\n'
  );

  // === Should not parse ===
  lexer.addToken(DefaultModeTokens.DateAtStart, '1900/03/03');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(HLedgerParser.journalItem(), '<journalItem!> 1900/03/03');
});

test('journalItem', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.journalItem()),
    {
      transaction: [
        {
          transactionInitLine: [
            {
              NEWLINE: 1,
              transactionDate: [
                {
                  DateAtStart: 1
                }
              ]
            }
          ]
        }
      ]
    },
    '<journalItem> 1900/01/01\\n'
  );

  lexer
    .addToken(CommentModeTokens.HASHTAG_AT_START, '#')
    .addToken(CommentModeTokens.CommentText, 'a full line comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.journalItem()),
    {
      lineComment: [
        {
          HASHTAG_AT_START: 1,
          CommentText: 1,
          NEWLINE: 1
        }
      ]
    },
    '<journalItem> # a full line comment\\n'
  );

  lexer
    .addToken(DefaultModeTokens.PDirective, 'P')
    .addToken(PriceModeTokens.PDirectiveDate, '2000/01/02')
    .addToken(PostingModeTokens.CommodityText, '€')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.50')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.journalItem()),
    {
      priceDirective: [
        {
          PDirective: 1,
          PDirectiveDate: 1,
          CommodityText: 1,
          NEWLINE: 1,
          amount: [
            {
              CommodityText: 1,
              Number: 1
            }
          ]
        }
      ]
    },
    '<journalItem> P 2000/01/02 € $1.50\\n'
  );

  lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.journalItem()),
    {
      accountDirective: [
        {
          AccountDirective: 1,
          RealAccountName: 1,
          NEWLINE: 1
        }
      ]
    },
    '<journalItem> account Assets:Chequing\\n'
  );

  // === Should not parse ===
  lexer.addToken(BasicTokens.Date, '1900/03/03');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    utils.simplifyCst(HLedgerParser.journalItem()),
    '<journalItem!> 1900/03/03'
  );

  lexer
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(
      CommentModeTokens.CommentText,
      'a comment with wrong semicolon token'
    );
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.journalItem(),
    '<journalItem!> ; a comment with wrong semicolon token'
  );
});

test('transaction', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transaction()),
    {
      transactionInitLine: [
        {
          NEWLINE: 1,
          transactionDate: [
            {
              DateAtStart: 1
            }
          ],
          description: [
            {
              Text: 1
            }
          ]
        }
      ]
    },
    '<transaction> 1900/01/01 description text\\n'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transaction()),
    {
      transactionInitLine: [
        {
          NEWLINE: 1,
          transactionDate: [
            {
              DateAtStart: 1
            }
          ],
          description: [
            {
              Text: 1
            }
          ]
        }
      ],
      transactionContentLine: [
        {
          INDENT: 1,
          NEWLINE: 1,
          posting: [
            {
              account: [
                {
                  RealAccountName: 1
                }
              ]
            }
          ]
        }
      ]
    },
    '<transaction> 1900/01/01 description text\\n    Assets:Chequing\\n'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transaction()),
    {
      transactionInitLine: [
        {
          NEWLINE: 1,
          transactionDate: [
            {
              DateAtStart: 1
            }
          ],
          description: [
            {
              Text: 1
            }
          ]
        }
      ],
      transactionContentLine: [
        {
          INDENT: 1,
          NEWLINE: 1,
          posting: [
            {
              account: [
                {
                  RealAccountName: 1
                }
              ]
            }
          ]
        },
        {
          INDENT: 1,
          NEWLINE: 1,
          inlineComment: [
            {
              SemicolonComment: 1,
              inlineCommentItem: [
                {
                  InlineCommentText: 1
                }
              ]
            }
          ]
        }
      ]
    },
    '<transaction> 1900/01/01 description text\\n    Assets:Chequing\\n    ; a comment\\n'
  );

  // === Should not parse ===
  lexer
    .addToken(BasicTokens.Date, '1900/03/03')
    .addToken(TxnLineModeTokens.Text, 'a description')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.transaction(),
    '<transaction!> 1900/03/03 a description\\n'
  );
});

test('priceDirective', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(DefaultModeTokens.PDirective, 'P')
    .addToken(PriceModeTokens.PDirectiveDate, '2000/01/01')
    .addToken(PostingModeTokens.CommodityText, '€')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.50')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.priceDirective()),
    {
      PDirective: 1,
      PDirectiveDate: 1,
      CommodityText: 1,
      NEWLINE: 1,
      amount: [
        {
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<priceDirective> P 2000/01/01 € $1.50\\n'
  );

  // === Should not parse ===
  lexer
    .addToken(DefaultModeTokens.PDirective, 'P')
    .addToken(PriceModeTokens.PDirectiveDate, '2000/01/01')
    .addToken(PostingModeTokens.CommodityText, '€')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.50');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.priceDirective(),
    '<priceDirective!> P 2000/01/01 € $1.50'
  );

  lexer
    .addToken(DefaultModeTokens.PDirective, 'P')
    .addToken(PriceModeTokens.PDirectiveDate, '2000/01/01')
    .addToken(PostingModeTokens.CommodityText, '€')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.priceDirective(),
    '<priceDirective!> P 2000/01/01 € $\\n'
  );

  lexer
    .addToken(DefaultModeTokens.PDirective, 'P')
    .addToken(PostingModeTokens.CommodityText, '€')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.50')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(HLedgerParser.priceDirective(), '<priceDirective!> P € $1.50\\n');
});

test('accountDirective', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.accountDirective()),
    {
      AccountDirective: 1,
      RealAccountName: 1,
      NEWLINE: 1
    },
    '<accountDirective>     account Assets:Chequing\\n'
  );

  lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.accountDirective()),
    {
      AccountDirective: 1,
      RealAccountName: 1,
      NEWLINE: 1,
      inlineComment: [
        {
          SemicolonComment: 1,
          inlineCommentItem: [
            {
              InlineCommentText: 1
            }
          ]
        }
      ]
    },
    '<accountDirective>     account Assets:Chequing ; a comment\\n'
  );

  lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.accountDirective()),
    {
      AccountDirective: 1,
      RealAccountName: 1,
      NEWLINE: 1,
      accountDirectiveContentLine: [
        {
          INDENT: 1,
          NEWLINE: 1,
          inlineComment: [
            {
              SemicolonComment: 1,
              inlineCommentItem: [
                {
                  InlineCommentText: 1
                }
              ]
            }
          ]
        }
      ]
    },
    '<accountDirective>     account Assets:Chequing\\n    ; a comment\\n'
  );

  lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n')
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'another comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.accountDirective()),
    {
      AccountDirective: 1,
      RealAccountName: 1,
      NEWLINE: 1,
      accountDirectiveContentLine: [
        {
          INDENT: 1,
          NEWLINE: 1,
          inlineComment: [
            {
              SemicolonComment: 1,
              inlineCommentItem: [
                {
                  InlineCommentText: 1
                }
              ]
            }
          ]
        },
        {
          INDENT: 1,
          NEWLINE: 1,
          inlineComment: [
            {
              SemicolonComment: 1,
              inlineCommentItem: [
                {
                  InlineCommentText: 1
                }
              ]
            }
          ]
        }
      ]
    },
    '<accountDirective>     account Assets:Chequing\\n    ; a comment\\n    ; another comment\\n'
  );

  // === Should not parse ===
  lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.VirtualAccountName, '(Assets:Chequing)')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.accountDirective(),
    '<accountDirective!>     account (Assets:Chequing)\\n'
  );

  lexer
    .addToken(DefaultModeTokens.AccountDirective, 'account')
    .addToken(PostingModeTokens.VirtualBalancedAccountName, '[Assets:Chequing]')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.accountDirective(),
    '<accountDirective!>     account [Assets:Chequing]\\n'
  );
});

test('accountDirectiveContentLine', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.accountDirectiveContentLine()),
    {
      INDENT: 1,
      NEWLINE: 1,
      inlineComment: [
        {
          SemicolonComment: 1
        }
      ]
    },
    '<accountDirectiveContentLine>     ;\\n'
  );

  // === Should not parse ===
  lexer
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.accountDirectiveContentLine(),
    '<accountDirectiveContentLine!>     ;'
  );

  lexer
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.accountDirectiveContentLine(),
    '<accountDirectiveContentLine!> ;\\n'
  );
});

test('transactionInitLine', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ]
    },
    '<transactionInitLine>     1900/01/01\\n'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.TxnStatusIndicator, '!')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      statusIndicator: [
        {
          TxnStatusIndicator: 1
        }
      ]
    },
    '<transactionInitLine>     1900/01/01 !\\n'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.TxnStatusIndicator, '!')
    .addToken(TxnLineModeTokens.ParenValue, '(#443)')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      statusIndicator: [
        {
          TxnStatusIndicator: 1
        }
      ],
      chequeNumber: [
        {
          ParenValue: 1
        }
      ]
    },
    '<transactionInitLine>     1900/01/01 ! (#443)\\n'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.TxnStatusIndicator, '!')
    .addToken(TxnLineModeTokens.ParenValue, '(#443)')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      statusIndicator: [
        {
          TxnStatusIndicator: 1
        }
      ],
      chequeNumber: [
        {
          ParenValue: 1
        }
      ],
      description: [
        {
          Text: 1
        }
      ]
    },
    '<transactionInitLine>     1900/01/01 ! (#443) description text\\n'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.TxnStatusIndicator, '!')
    .addToken(TxnLineModeTokens.ParenValue, '(#443)')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      statusIndicator: [
        {
          TxnStatusIndicator: 1
        }
      ],
      chequeNumber: [
        {
          ParenValue: 1
        }
      ],
      description: [
        {
          Text: 1
        }
      ],
      inlineComment: [
        {
          SemicolonComment: 1,
          inlineCommentItem: [
            {
              InlineCommentText: 1
            }
          ]
        }
      ]
    },
    '<transactionInitLine>     1900/01/01 ! (#443) description text ; a comment\\n'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.ParenValue, '(#443)')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      chequeNumber: [
        {
          ParenValue: 1
        }
      ],
      description: [
        {
          Text: 1
        }
      ],
      inlineComment: [
        {
          SemicolonComment: 1,
          inlineCommentItem: [
            {
              InlineCommentText: 1
            }
          ]
        }
      ]
    },
    '<transactionInitLine>     1900/01/01 (#443) description text ; a comment\\n'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(TxnLineModeTokens.Text, 'description text')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      description: [
        {
          Text: 1
        }
      ],
      inlineComment: [
        {
          SemicolonComment: 1,
          inlineCommentItem: [
            {
              InlineCommentText: 1
            }
          ]
        }
      ]
    },
    '<transactionInitLine>     1900/01/01 description text ; a comment\\n'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionInitLine()),
    {
      NEWLINE: 1,
      transactionDate: [
        {
          DateAtStart: 1
        }
      ],
      inlineComment: [
        {
          SemicolonComment: 1,
          inlineCommentItem: [
            {
              InlineCommentText: 1
            }
          ]
        }
      ]
    },
    '<transactionInitLine>     1900/01/01 ; a comment\\n'
  );

  // === Should not parse ===
  lexer.addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(HLedgerParser.transactionInitLine(), '<transactionInitLine!> \\n');

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1901/02/02')
    .addToken(TxnLineModeTokens.Text, 'description text');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionInitLine(),
    '<transactionInitLine!> 1901/02/02 description text'
  );
});

test('transactionContentLine', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionContentLine()),
    {
      INDENT: 1,
      NEWLINE: 1,
      posting: [
        {
          account: [
            {
              RealAccountName: 1
            }
          ]
        }
      ]
    },
    '<transactionContentLine>     Assets:Chequing\\n'
  );

  lexer
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionContentLine()),
    {
      INDENT: 1,
      NEWLINE: 1,
      inlineComment: [
        {
          SemicolonComment: 1,
          inlineCommentItem: [
            {
              InlineCommentText: 1
            }
          ]
        }
      ]
    },
    '<transactionContentLine>     ; a comment\\n'
  );

  // === Should not parse ===
  lexer
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.NEWLINE, '\n');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionContentLine(),
    '<transactionContentLine!> Assets:Chequing\\n'
  );

  lexer
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionContentLine(),
    '<transactionContentLine!>     Assets:Chequing'
  );

  lexer
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.CommentText, 'a comment');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionContentLine(),
    '<transactionContentLine!> ; a comment\\n'
  );

  lexer
    .addToken(DefaultModeTokens.INDENT, '    ')
    .addToken(CommentModeTokens.SemicolonComment, ';')
    .addToken(CommentModeTokens.CommentText, 'a comment');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(
    HLedgerParser.transactionContentLine(),
    '<transactionContentLine!>     ; a comment'
  );
});

test('posting', (t) => {
  const lexer = new utils.MockLexer();

  lexer.addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.posting()),
    {
      account: [
        {
          RealAccountName: 1
        }
      ]
    },
    '<posting> Assets:Chequing'
  );

  lexer.addToken(PostingModeTokens.PostingStatusIndicator, '*');
  lexer.addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.posting()),
    {
      statusIndicator: [
        {
          PostingStatusIndicator: 1
        }
      ],
      account: [
        {
          RealAccountName: 1
        }
      ]
    },
    '<posting> * Assets:Chequing'
  );

  lexer
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.posting()),
    {
      account: [
        {
          RealAccountName: 1
        }
      ],
      amount: [
        {
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<posting> Assets:Chequing    $1.00'
  );

  lexer
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.AT, '@')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.posting()),
    {
      account: [
        {
          RealAccountName: 1
        }
      ],
      lotPrice: [
        {
          AT: 1,
          amount: [
            {
              CommodityText: 1,
              Number: 1
            }
          ]
        }
      ]
    },
    '<posting> Assets:Chequing    @ $1.00'
  );

  lexer
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.posting()),
    {
      account: [
        {
          RealAccountName: 1
        }
      ],
      assertion: [
        {
          EQUALS: 1,
          amount: [
            {
              CommodityText: 1,
              Number: 1
            }
          ]
        }
      ]
    },
    '<posting> Assets:Chequing    = $1.00'
  );

  lexer
    .addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing')
    .addToken(CommentModeTokens.SemicolonComment, '=')
    .addToken(CommentModeTokens.InlineCommentText, 'a comment');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.posting()),
    {
      account: [
        {
          RealAccountName: 1
        }
      ],
      inlineComment: [
        {
          SemicolonComment: 1,
          inlineCommentItem: [
            {
              InlineCommentText: 1
            }
          ]
        }
      ]
    },
    '<posting> Assets:Chequing  ; a comment'
  );

  // === Should not parse ===
  lexer.addToken(PostingModeTokens.PostingStatusIndicator, '!');
  lexer.addToken(PostingModeTokens.Number, '1.00');
  lexer.addToken(PostingModeTokens.CommodityText, '$');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(HLedgerParser.posting(), '<posting!> ! 1.00$');
});

test('transactionDate', (t) => {
  const lexer = new utils.MockLexer();

  lexer.addToken(DefaultModeTokens.DateAtStart, '1900/01/01');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionDate()),
    {
      DateAtStart: 1
    },
    '<transactionDate> 1900/01/01'
  );

  lexer
    .addToken(DefaultModeTokens.DateAtStart, '1900/01/01')
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.Date, '1901/02/02');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.transactionDate()),
    {
      DateAtStart: 1,
      EQUALS: 1,
      Date: 1
    },
    '<transactionDate> 1900/01/01=1901/02/02'
  );

  // === Should not parse ===
  lexer.addToken(BasicTokens.Date, '1900/03/03');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(HLedgerParser.transactionDate(), '<transactionDate!> 1900/03/03');

  lexer.addToken(DefaultModeTokens.DateAtStart, '1900/03/03');
  lexer.addToken(BasicTokens.EQUALS, '=');
  HLedgerParser.input = lexer.tokenize();

  t.falsy(HLedgerParser.transactionDate(), '<transactionDate!> 1900/03/03');
});

test('account', (t) => {
  const lexer = new utils.MockLexer();

  lexer.addToken(PostingModeTokens.RealAccountName, 'Assets:Chequing');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.account()),
    {
      RealAccountName: 1
    },
    '<account> Assets:Chequing'
  );

  lexer.addToken(PostingModeTokens.VirtualAccountName, '(Assets:Chequing)');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.account()),
    {
      VirtualAccountName: 1
    },
    '<account> (Assets:Chequing)'
  );

  lexer.addToken(
    PostingModeTokens.VirtualBalancedAccountName,
    '[Assets:Chequing]'
  );
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.account()),
    {
      VirtualBalancedAccountName: 1
    },
    '<account> [Assets:Chequing]'
  );
});

test('amount', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(BasicTokens.DASH, '-')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.amount()),
    {
      DASH: 1,
      Number: 1,
      CommodityText: 1
    },
    '<amount> -$1.00'
  );

  lexer
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1
    },
    '<amount> $1.00'
  );

  lexer
    .addToken(PostingModeTokens.Number, '1.00')
    .addToken(PostingModeTokens.CommodityText, '$');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.amount()),
    {
      Number: 1,
      CommodityText: 1
    },
    '<amount> 1.00$'
  );

  lexer.addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.amount()),
    {
      Number: 1
    },
    '<amount> 1.00'
  );
});

test('lotPrice', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(BasicTokens.LPAREN, '(')
    .addToken(BasicTokens.AT, '@')
    .addToken(BasicTokens.RPAREN, ')')
    .addToken(PostingModeTokens.Number, '1.00')
    .addToken(PostingModeTokens.CommodityText, '$');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.lotPrice()),
    {
      LPAREN: 1,
      RPAREN: 1,
      AT: 1,
      amount: [
        {
          Number: 1,
          CommodityText: 1
        }
      ]
    },
    '<lotPrice> (@) 1.00$'
  );

  lexer
    .addToken(BasicTokens.LPAREN, '(')
    .addToken(BasicTokens.AT, '@')
    .addToken(BasicTokens.AT, '@')
    .addToken(BasicTokens.RPAREN, ')')
    .addToken(PostingModeTokens.Number, '1.00')
    .addToken(PostingModeTokens.CommodityText, '$');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.lotPrice()),
    {
      LPAREN: 1,
      RPAREN: 1,
      AT: 2,
      amount: [
        {
          Number: 1,
          CommodityText: 1
        }
      ]
    },
    '<lotPrice> (@@) 1.00$'
  );

  lexer
    .addToken(BasicTokens.AT, '@')
    .addToken(PostingModeTokens.Number, '1.00')
    .addToken(PostingModeTokens.CommodityText, '$');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.lotPrice()),
    {
      AT: 1,
      amount: [
        {
          Number: 1,
          CommodityText: 1
        }
      ]
    },
    '<lotPrice> @ 1.00$'
  );

  lexer
    .addToken(BasicTokens.AT, '@')
    .addToken(BasicTokens.AT, '@')
    .addToken(PostingModeTokens.Number, '1.00')
    .addToken(PostingModeTokens.CommodityText, '$');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.lotPrice()),
    {
      AT: 2,
      amount: [
        {
          Number: 1,
          CommodityText: 1
        }
      ]
    },
    '<lotPrice> @@ 1.00$'
  );
});

test('assertion', (t) => {
  const lexer = new utils.MockLexer();

  lexer
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.ASTERISK, '*')
    .addToken(BasicTokens.DASH, '-')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.assertion()),
    {
      EQUALS: 2,
      ASTERISK: 1,
      amount: [
        {
          DASH: 1,
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<assertion> ==* -$1.00'
  );

  lexer
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.DASH, '-')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.assertion()),
    {
      EQUALS: 2,
      amount: [
        {
          DASH: 1,
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<assertion> == -$1.00'
  );

  lexer
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.ASTERISK, '*')
    .addToken(BasicTokens.DASH, '-')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.assertion()),
    {
      EQUALS: 1,
      ASTERISK: 1,
      amount: [
        {
          DASH: 1,
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<assertion> =* -$1.00'
  );

  lexer
    .addToken(BasicTokens.EQUALS, '=')
    .addToken(BasicTokens.DASH, '-')
    .addToken(PostingModeTokens.CommodityText, '$')
    .addToken(PostingModeTokens.Number, '1.00');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.assertion()),
    {
      EQUALS: 1,
      amount: [
        {
          DASH: 1,
          CommodityText: 1,
          Number: 1
        }
      ]
    },
    '<assertion> = -$1.00'
  );
});

test('statusIndicator', (t) => {
  const lexer = new utils.MockLexer();

  lexer.addToken(PostingModeTokens.PostingStatusIndicator, '!');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.statusIndicator()),
    {
      PostingStatusIndicator: 1
    },
    '<statusIndicator> ! (posting status)'
  );

  lexer.addToken(TxnLineModeTokens.TxnStatusIndicator, '*');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.statusIndicator()),
    {
      TxnStatusIndicator: 1
    },
    '<statusIndicator> * (transaction status)'
  );
});

test('chequeNumber', (t) => {
  const lexer = new utils.MockLexer();

  lexer.addToken(TxnLineModeTokens.ParenValue, '(#443)');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.chequeNumber()),
    {
      ParenValue: 1
    },
    '<chequeNumber> (#443)'
  );
});

test('description', (t) => {
  const lexer = new utils.MockLexer();

  lexer.addToken(TxnLineModeTokens.Text, 'descriptionText');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.description()),
    {
      Text: 1
    },
    '<description> descriptionText'
  );

  lexer.addToken(TxnLineModeTokens.Text, 'payee');
  lexer.addToken(BasicTokens.PIPE, '|');
  lexer.addToken(TxnLineModeTokens.Text, 'memo');
  HLedgerParser.input = lexer.tokenize();

  t.deepEqual(
    utils.simplifyCst(HLedgerParser.description()),
    {
      Text: 2,
      PIPE: 1
    },
    '<description> payee|memo'
  );
});
