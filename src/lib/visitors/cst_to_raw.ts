import HLedgerParser from '../parser';
import { notEmpty } from '../type_utils';

import type * as ParserTypes from '../hledger_cst';
import type * as Core from '../types';
import type * as Raw from './raw_types';

const BaseCstVisitor = HLedgerParser.getBaseCstVisitorConstructor();

class HledgerToRawVisitor extends BaseCstVisitor {
  constructor() {
    super();

    this.validateVisitor();
  }

  journal(ctx: ParserTypes.JournalCstChildren): Raw.Journal {
    const journalItems = ctx.journalItem?.map((j) =>
      this.journalItem(j.children)
    );
    // Remove nulls from journalItems that arise from empty lines
    return journalItems?.filter(notEmpty) ?? [];
  }

  journalItem(ctx: ParserTypes.JournalItemCstChildren): Raw.JournalItem | null {
    if (ctx.transaction) {
      return {
        type: 'transaction',
        value: this.transaction(ctx.transaction[0].children)
      };
    } else if (ctx.lineComment) {
      return {
        type: 'comment',
        value: this.lineComment(ctx.lineComment[0].children)
      };
    } else if (ctx.priceDirective) {
      return {
        type: 'priceDirective',
        value: this.priceDirective(ctx.priceDirective[0].children)
      };
    } else if (ctx.accountDirective) {
      return {
        type: 'accountDirective',
        value: this.accountDirective(ctx.accountDirective[0].children)
      };
    } else {
      return null;
    }
  }

  lineComment(ctx: ParserTypes.LineCommentCstChildren): Raw.Comment['value'] {
    return ctx.CommentText?.[0]?.image.trim() ?? '';
  }

  inlineComment(ctx: ParserTypes.InlineCommentCstChildren): Raw.InlineComment {
    const inlineCommentItems = ctx.inlineCommentItem
      ? ctx.inlineCommentItem.map((c) => this.inlineCommentItem(c.children))
      : [];

    return { type: 'inlineComment', value: inlineCommentItems };
  }

  inlineCommentItem(
    ctx: ParserTypes.InlineCommentItemCstChildren
  ): Raw.InlineCommentItem {
    if (ctx.InlineCommentText) return ctx.InlineCommentText[0].image.trim();
    if (ctx.tag) return this.tag(ctx.tag[0].children);

    return ''; // blank comment if nothing else
  }

  tag(ctx: ParserTypes.TagCstChildren): Raw.Tag {
    return {
      type: 'tag',
      value: {
        name: ctx.InlineCommentTagName[0].image,
        value: ctx.InlineCommentTagValue?.[0].image ?? undefined
      }
    };
  }

  transaction(
    ctx: ParserTypes.TransactionCstChildren
  ): Raw.Transaction['value'] {
    const { date, postingDate, description, status, chequeNumber, comment } =
      this.transactionInitLine(ctx.transactionInitLine[0].children);
    const contentLines =
      ctx.transactionContentLine
        ?.map((p) => this.transactionContentLine(p.children))
        ?.filter(notEmpty) ?? [];

    return {
      date,
      postingDate,
      description,
      status,
      chequeNumber,
      comment,
      contentLines
    };
  }

  priceDirective(
    ctx: ParserTypes.PriceDirectiveCstChildren
  ): Raw.PriceDirective['value'] {
    return {
      date: ctx.PDirectiveDate[0].image,
      commodity: ctx.CommodityText[0].payload as string,
      price: this.amount(ctx.amount[0].children)
    };
  }

  accountDirective(
    ctx: ParserTypes.AccountDirectiveCstChildren
  ): Raw.AccountDirective['value'] {
    const contentLines = ctx.accountDirectiveContentLine
      ?.map((a) => this.accountDirectiveContentLine(a.children))
      ?.filter(notEmpty);

    return {
      account: ctx.RealAccountName[0].payload as string[],
      comments: ctx.inlineComment
        ? this.inlineComment(ctx.inlineComment[0].children)
        : undefined,
      contentLines: contentLines ?? []
    };
  }

  accountDirectiveContentLine(
    ctx: ParserTypes.AccountDirectiveContentLineCstChildren
  ): Raw.AccountDirectiveContentLine | null {
    //    if (ctx.inlineComment) // needed when more account directive types added
    return this.inlineComment(ctx.inlineComment[0].children);

    // return null;
  }

  transactionInitLine(
    ctx: ParserTypes.TransactionInitLineCstChildren
  ): Raw.TransactionInitLine {
    const { date, postingDate } = this.transactionDate(
      ctx.transactionDate[0].children
    );
    const chequeNumber = ctx.chequeNumber
      ? this.chequeNumber(ctx.chequeNumber[0].children)
      : null;
    const status = ctx.statusIndicator
      ? this.statusIndicator(ctx.statusIndicator[0].children)
      : null;
    const comment = ctx.inlineComment
      ? this.inlineComment(ctx.inlineComment[0].children)
      : null;
    const description = ctx.description
      ? this.description(ctx.description[0].children)
      : null;

    return {
      date,
      postingDate,
      description: description ?? '',
      status: status ?? 'unmarked',
      chequeNumber: chequeNumber ?? undefined,
      comment: comment ?? undefined
    };
  }

  transactionContentLine(
    ctx: ParserTypes.TransactionContentLineCstChildren
  ): Raw.TransactionItem | null {
    if (ctx.posting) {
      return this.posting(ctx.posting[0].children);
    } else if (ctx.inlineComment) {
      return this.inlineComment(ctx.inlineComment[0].children);
    }

    return null;
  }

  posting(ctx: ParserTypes.PostingCstChildren): Raw.Posting {
    const account = this.account(ctx.account[0].children);
    const amount = ctx.amount ? this.amount(ctx.amount[0].children) : null;
    const lotPrice = ctx.lotPrice
      ? this.lotPrice(ctx.lotPrice[0].children)
      : null;
    const assertion = ctx.assertion
      ? this.assertion(ctx.assertion[0].children)
      : null;
    const statusIndicator = ctx.statusIndicator
      ? this.statusIndicator(ctx.statusIndicator[0].children)
      : null;
    const comment = ctx.inlineComment
      ? this.inlineComment(ctx.inlineComment[0].children)
      : null;

    return {
      type: 'posting',
      value: {
        account,
        amount: amount ?? undefined,
        lotPrice: lotPrice ?? undefined,
        assertion: assertion ?? undefined,
        status: statusIndicator ?? 'unmarked',
        comment: comment ?? undefined
      }
    };
  }

  transactionDate(
    ctx: ParserTypes.TransactionDateCstChildren
  ): Raw.TransactionDate {
    const date = ctx.DateAtStart[0].image;
    const postingDate = ctx.Date?.[0].image;

    return { date, postingDate };
  }

  account(ctx: ParserTypes.AccountCstChildren): Core.Account {
    if (ctx.RealAccountName) {
      return { type: 'real', name: ctx.RealAccountName[0].payload as string[] };
    } else if (ctx.VirtualAccountName) {
      return {
        type: 'virtual',
        name: ctx.VirtualAccountName[0].payload as string[]
      };
    } else if (ctx.VirtualBalancedAccountName) {
      return {
        type: 'virtualBalanced',
        name: ctx.VirtualBalancedAccountName[0].payload as string[]
      };
    }
    return { type: 'real', name: [''] }; // Default is a real account with a blank name
  }

  amount(ctx: ParserTypes.AmountCstChildren): Core.Amount {
    // TODO: Needs error checking, robust parsing for different decimal marks, etc., or maybe parsing only happens in "cooked" version of parse tree?

    // We know from examining the parser that ctx.Number always exists
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const value = (ctx.DASH ? '-' : '') + ctx.Number![0].image;
    const commodity = ctx.CommodityText
      ? (ctx.CommodityText[0].payload as string)
      : '';

    return {
      value,
      commodity
    };
  }

  lotPrice(ctx: ParserTypes.LotPriceCstChildren): Core.LotPrice {
    const amount = this.amount(ctx.amount[0].children);

    // Know from examining the parser that ctx.AT always exists in this rule
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const lotPriceType = ctx.AT!.length === 2 ? 'total' : 'unit';

    return {
      amount,
      lotPriceType
    };
  }

  assertion(ctx: ParserTypes.AssertionCstChildren): Core.Assertion {
    const amount = this.amount(ctx.amount[0].children);
    const type = ctx.EQUALS.length == 2 ? 'strong' : 'normal';
    const subaccounts = !!ctx.ASTERISK;

    return { amount, type, subaccounts };
  }

  statusIndicator(
    ctx: ParserTypes.StatusIndicatorCstChildren
  ): Core.StatusIndicator | null {
    // Know from examining the parser that ctx.PostingStatus will exist if TxnStatusIndicator does not
    const tokenText = (
      ctx.TxnStatusIndicator
        ? ctx.TxnStatusIndicator[0].image
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          ctx.PostingStatusIndicator![0].image
    ) as '!' | '*';

    switch (tokenText) {
      case '!':
        return 'pending';
      case '*':
        return 'cleared';
    }
  }

  chequeNumber(
    ctx: ParserTypes.ChequeNumberCstChildren
  ): Raw.TransactionInitLine['chequeNumber'] | null {
    return ctx.ParenValue[0].payload as string;
  }

  description(ctx: ParserTypes.DescriptionCstChildren): Core.TxnDescription {
    if (ctx.Text.length == 1) {
      return ctx.Text[0].image.trim();
    } else if (ctx.Text.length == 2) {
      return {
        payee: ctx.Text[0].image.trim(),
        memo: ctx.Text[1].image.trim()
      };
    } else {
      return ''; // default blank description
    }
  }
}

export default new HledgerToRawVisitor();
