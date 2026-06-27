export class Money {
  private constructor(
    private readonly cents: number,
    private readonly currency: string,
  ) {
    if (!Number.isInteger(cents)) {
      throw new Error("Money cents must be an integer");
    }
  }

  static fromNumber(amount: number, currency: "BRL" = "BRL"): Money {
    if (!Number.isFinite(amount)) {
      throw new Error("Invalid monetary amount: not finite");
    }

    const cents = Math.round(amount * 100);

    if (Math.abs(cents / 100 - amount) > 1e-9) {
      throw new Error("Amount must have at most 2 decimal places");
    }

    return new Money(cents, currency);
  }

  static fromCents(cents: number, currency: "BRL" = "BRL"): Money {
    return new Money(cents, currency);
  }

  toNumber(): number {
    return this.cents / 100;
  }

  toCents(): number {
    return this.cents;
  }
}
