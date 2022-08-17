import { descriptionIsPayeeMemo } from '../type_utils';

import type * as Core from '../types';
import type * as Cooked from './cooked_types';

interface CookedToStringVisitorOptions {
  dateSeparator: '/' | '.' | '-';
  commodityBeforeAmount: boolean;
}

const CookedToStringVisitorOptionsDefault: CookedToStringVisitorOptions = {
  dateSeparator: '/',
  commodityBeforeAmount: true
};

export default class CookedToStringVisitor {
  private _options: CookedToStringVisitorOptions =
    CookedToStringVisitorOptionsDefault;

  constructor(options?: Partial<CookedToStringVisitorOptions>) {
    if (!options) options = CookedToStringVisitorOptionsDefault;
    this._options = {
      ...CookedToStringVisitorOptionsDefault,
      ...options
    };
  }

  journal(node: Cooked.Journal): string {
    let result = '';
    result = node.transactions.reduce(
      (resultStr, txn) => (resultStr += this.transaction(txn) + '\n'),
      result
    );
    result = node.prices.reduce(
      (resultStr, price) => (resultStr += this.price(price) + '\n'),
      result
    );
    result = node.accounts.reduce(
      (resultStr, acct) => (resultStr += this.account(acct) + '\n'),
      result
    );
    return result;
  }

  transaction(node: Cooked.Transaction): string {
    let result = this._formatDate(node.date);
    result += node.postingDate
      ? `=${this._formatDate(node.postingDate)} `
      : ' ';
    result +=
      node.status !== 'unmarked'
        ? `${this._formatStatusIndicator(node.status)} `
        : '';
    result += node.chequeNumber ? `(${node.chequeNumber}) ` : '';
    result += descriptionIsPayeeMemo(node.description)
      ? `${node.description.payee} | ${node.description.memo}`
      : '';
    if (node.tags.length > 0) {
      result += ' ; ';
      result += node.tags
        .map((tag) => `${tag.name}: ${tag.value ?? ''}`)
        .join(', ');
    }
    result += '\n';
    result += node.postings
      .map((postingItem) => this.posting(postingItem))
      .join('\n');
    return result;
  }

  posting(node: Cooked.Posting): string {
    let result =
      ' '.repeat(4) +
      (node.status !== 'unmarked'
        ? `${this._formatStatusIndicator(node.status)} `
        : '');

    switch (node.account.type) {
      case 'real':
        result += node.account.name.join(':');
        break;
      case 'virtual':
        result += `(${node.account.name.join(':')})`;
        break;
      case 'virtualBalanced':
        result += `[${node.account.name.join(':')}]`;
        break;
    }

    if (node.amount) {
      if (this._options.commodityBeforeAmount) {
        const amountText = `${node.amount.commodity} ${node.amount.value}`;
        const spacer = ' '.repeat(60 - amountText.length - result.length);
        result += `${spacer}${amountText}`;
      } else {
        const amountText = `${node.amount.value} ${node.amount.commodity}`;
        const spacer = ' '.repeat(
          60 - result.length - node.amount.value.length
        );
        result += `${spacer}${amountText}`;
      }
    }
    return result;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  price(node: Cooked.Price): string {
    return '';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  account(node: Cooked.Account): string {
    return '';
  }

  private _formatDate(date: Core.Date): string {
    return `${date.y}${this._options.dateSeparator}${date.m}${this._options.dateSeparator}${date.d}`;
  }

  private _formatStatusIndicator(status: Core.StatusIndicator): string {
    switch (status) {
      case 'cleared':
        return '*';
      case 'pending':
        return '!';
      default:
        return '';
    }
  }
}
