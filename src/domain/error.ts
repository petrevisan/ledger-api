export abstract class DomainError extends Error {
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class AccountNotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(accountID: string) {
    super(`Account ${accountID} not found`);
  }
}

export class UnbalancedTransactionError extends DomainError {
  readonly statusCode = 422;

  constructor() {
    super(
      "Transaction entries must balance: sum of debits must equal sum of credits",
    );
  }
}

export class ValidationError extends DomainError {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}

export class DuplicateTransactionError extends DomainError {
  readonly statusCode = 409;

  constructor(originalTransactionID: string) {
    super(
      `Duplicate transaction detected. Original transaction ID: ${originalTransactionID}. This operation was already processed within the last 15 minutes.`,
    );
  }
}

export class EmptyTransactionError extends DomainError {
  readonly statusCode = 400;

  constructor() {
    super("Transaction must have at least one entry");
  }
}
