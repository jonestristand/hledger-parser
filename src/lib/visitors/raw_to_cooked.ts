import _ from 'lodash';
import { DateTime } from 'luxon';

import * as Core from '../types';

import * as Cooked from './cooked_types';
import * as Raw from './raw_types';

interface RawToCookedVisitorState {
  defaultYear: number;
}

const defaultRawToCookedVisitorState: RawToCookedVisitorState = {
  defaultYear: DateTime.now().year
};

export default class RawToCookedVisitor {
  private _state: RawToCookedVisitorState = defaultRawToCookedVisitorState;

  journal(node: Raw.Journal): Cooked.Journal {
    this._state = defaultRawToCookedVisitorState; // reset state
    const jrnl = node.reduce<Cooked.Journal>(
      (cookedJournal, rawItem) => {
        switch (rawItem.type) {
          case 'transaction':
            cookedJournal.transactions.push(this.transaction(rawItem));
            break;

          case 'priceDirective':
            cookedJournal.prices.push(this.priceDirective(rawItem));
            break;

          case 'accountDirective':
            cookedJournal.accounts.push(this.accountDirective(rawItem));
            break;
        }
        return cookedJournal;
      },
      { transactions: [], accounts: [], prices: [] }
    );

    return jrnl;
  }

  transaction(node: Raw.Transaction): Cooked.Transaction {
    let lastPosting: Cooked.Posting | null; // track in order to attach comment lines
    const myTags: Core.Tag[] = this._collectTags(node.value.comment?.value); // tags for the transaction itself

    const postings = node.value.contentLines.reduce<Cooked.Posting[]>(
      (cookedPostings, rawItem) => {
        if (rawItem.type === 'posting') {
          lastPosting = {
            ..._.omit(rawItem.value, 'comment'), // do not include the value of the comment field, just take the tags
            tags: this._collectTags(rawItem.value.comment?.value)
          };
          cookedPostings.push(lastPosting);
        } else {
          const tags = this._collectTags(rawItem.value);

          if (lastPosting) {
            // belong to the posting on preceding lines, attach
            lastPosting.tags.push(...tags);
          } else {
            // belong to the transaction itself
            myTags.push(...tags);
          }
        }
        return cookedPostings;
      },
      []
    );
    const date = this._parseDate(node.value.date);
    const postingDate = node.value.postingDate
      ? this._parseDate(node.value.postingDate)
      : null;

    return {
      date: date,
      postingDate: postingDate ?? undefined,
      status: node.value.status,
      chequeNumber: node.value.chequeNumber,
      description: node.value.description,
      postings,
      tags: myTags
    };
  }

  priceDirective(node: Raw.PriceDirective): Cooked.Price {
    return {
      date: this._parseDate(node.value.date),
      commodity: node.value.commodity,
      price: node.value.price
    };
  }

  accountDirective(node: Raw.AccountDirective): Cooked.Account {
    const tagsOnLine = this._collectTags(node.value.comments?.value);
    const tagsInContents = this._collectTags(
      _.flatten(
        node.value.contentLines.map((c) => c.value).filter(Core.notEmpty)
      )
    );
    return {
      account: node.value.account,
      tags: [...tagsOnLine, ...tagsInContents]
    };
  }

  private _collectTags(commentLines?: Raw.InlineCommentItem[]) {
    if (!commentLines) return [];

    return commentLines.reduce<Core.Tag[]>((tags, cmtItem) => {
      if (typeof cmtItem !== 'string') tags.push(cmtItem.value);
      return tags;
    }, []);
  }

  private _dateRegex = /^(?:(\d\d\d\d)[.\-/])?(\d\d?)[.\-/](\d\d?)$/;
  private _parseDate(date: string) {
    const match = this._dateRegex.exec(date);
    if (match) {
      const parsedDate: Core.Date = {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        y: parseInt(match[1] ?? this._state.defaultYear),
        m: parseInt(match[2]),
        d: parseInt(match[3])
      };
      // Ensure valid
      if (DateTime.utc(parsedDate.y, parsedDate.m, parsedDate.d).isValid)
        return parsedDate;
    }

    throw new Error(`Invalid date found: ${date}`);
  }
}
