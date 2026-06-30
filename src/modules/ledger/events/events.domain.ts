import type { MoneyDirection } from "../../../domain/money-direction.js";
import type { Money } from "../../../domain/money.js";
import {
  EmptyTransactionError,
  UnbalancedTransactionError,
} from "../../../domain/error.js";

export interface Entry {
  accountId: string;
  direction: MoneyDirection;
  amount: Money;
}

export const EventTypesEnum = [
  "money_transferred",
  "transfer_reversed",
] as const;
export type EventTypes = (typeof EventTypesEnum)[number];

export class Event {
  constructor(
    readonly id: string,
    readonly type: EventTypes,
    readonly entries: Readonly<Entry[]>,
  ) {
    if (entries.length === 0) {
      throw new EmptyTransactionError();
    }

    if (!this.isBalanced()) {
      throw new UnbalancedTransactionError();
    }
  }

  private isBalanced(): boolean {
    const balance = this.entries
      .map((entry) => {
        const cents = entry.amount.toCents();
        return entry.direction === "debit" ? cents : -cents;
      })
      .reduce((sum, cents) => sum + cents, 0);

    return balance === 0;
  }
}
