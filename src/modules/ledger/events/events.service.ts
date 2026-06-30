import { randomUUID } from "node:crypto";
import { Money } from "../../../domain/money.js";
import type { EventResponse, TransferRequest } from "./events.dto.js";
import { type Entry, Event } from "./events.domain.js";
import { EventsRepository } from "./events.repository.js";

export class EventsService {
  constructor(private readonly eventsRepository = new EventsRepository()) {}

  async transfer(input: TransferRequest): Promise<EventResponse> {
    const money = Money.fromCents(input.amount);

    const entries: Entry[] = [
      { accountId: input.fromAccountId, direction: "debit", amount: money },
      { accountId: input.toAccountId, direction: "credit", amount: money },
    ];

    const event = new Event(randomUUID(), "money_transferred", entries);

    const storeEvent = await this.eventsRepository.createEvent(event);

    return {
      id: storeEvent.id,
      type: storeEvent.type,
      occurredAt: storeEvent.occurredAt.toISOString(),
      entries: event.entries.map((entry) => ({
        accountId: entry.accountId,
        direction: entry.direction,
        amount: entry.amount.toCents(),
      })),
    };
  }
}
