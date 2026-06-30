import { sql } from "drizzle-orm";
import {
  pgTable,
  pgView,
  varchar,
  uuid,
  timestamp,
  bigint,
  jsonb,
  index,
  check,
  pgEnum,
} from "drizzle-orm/pg-core";
import { EventTypesEnum } from "../../modules/ledger/events/events.domain.js";

export const directionEnum = pgEnum("direction", ["debit", "credit"]);

export const eventTypesEnum = pgEnum("event_types", EventTypesEnum);

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().notNull().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
});

export const accountsTable = pgTable("accounts", {
  accountId: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id),
  currency: varchar({ length: 3 }).notNull().default("BRL"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// EVENT STORE - WRITE SIDE
export const eventsTable = pgTable(
  "events",
  {
    position: bigint({ mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    id: uuid().notNull().unique(),
    type: eventTypesEnum().notNull(),
    entries: jsonb().notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("events_type_idx").on(table.type)],
);

export const entriesTable = pgTable(
  "entries",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => eventsTable.id),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accountsTable.accountId),
    direction: directionEnum().notNull(),
    amount: bigint({ mode: "number" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("entries_account_idx").on(table.accountId),
    index("entries_event_idx").on(table.eventId),
    // amount é sempre uma magnitude positiva; o sinal vive na `direction`.
    check("entries_amount_positive", sql`${table.amount} > 0`),
  ],
);

/* READ MODEL de saldo — Abordagem A (síncrona, calculada na leitura).
 *
 * O saldo NÃO é armazenado: a view recalcula o SUM das entries a cada
 * SELECT, somando no próprio banco (mais rápido que trazer as linhas e
 * somar no app — só o resultado trafega pela rede).
 *
 * Convenção: conta do titular como PASSIVO (visão bancária) →
 *   credit aumenta o saldo (entrou: depositei na sua conta)
 *   debit  diminui o saldo (saiu: debitei da sua conta)
 * balance = Σ(credit) - Σ(debit), em centavos.
 *
 * ⚠️ Escala: como o ledger é append-only, o nº de entries por conta só
 * cresce, e o saldo é lido muito mais do que escrito (inclusive para
 * autorizar transferências). Em sistemas reais de larga escala, este
 * recálculo O(n) se torna gargalo e seria substituído/otimizado por:
 *   - tabela materializada de saldo (leitura O(1)); e/ou
 *   - SNAPSHOTS (posicionais ou temporais/fim-de-dia): um checkpoint do
 *     saldo numa dada position, somando apenas as entries posteriores —
 *     limitando o recálculo a uma janela recente em vez de todo o histórico.
 */
export const accountsBalancesView = pgView("accounts_balances_view").as((qb) =>
  qb
    .select({
      accountId: entriesTable.accountId,
      balance: sql<number>`
        coalesce(sum(
          case when ${entriesTable.direction} = 'credit'
               then ${entriesTable.amount}
               else -${entriesTable.amount}
          end
        ), 0)`.as("balance"),
    })
    .from(entriesTable)
    .groupBy(entriesTable.accountId),
);
