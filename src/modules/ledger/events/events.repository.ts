import { db } from "../../../infra/database/client.js";
import { entriesTable, eventsTable } from "../../../infra/database/schema.js";
import type { Event } from "./events.domain.js";

export class EventsRepository {
  async createEvent(event: Event) {
    return db.transaction(async (tx) => {
      const entries = event.entries.map((entry) => ({
        accountId: entry.accountId,
        direction: entry.direction,
        amount: entry.amount.toCents(),
      }));

      const [row] = await tx
        .insert(eventsTable)
        .values({
          id: event.id,
          type: event.type,
          entries,
        })
        .returning();

      await tx.insert(entriesTable).values(
        entries.map((entry) => ({
          eventId: event.id,
          accountId: entry.accountId,
          direction: entry.direction,
          amount: entry.amount,
        })),
      );

      return row;
    });
  }
}
