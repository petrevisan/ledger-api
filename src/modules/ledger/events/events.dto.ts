import { z } from "zod";
import { MoneyDirectionSchema } from "../../../domain/money-direction.js";
import { EventTypesEnum } from "./events.domain.js";

export const transferRequestSchema = z.object({
  fromAccountId: z.uuid(),
  toAccountId: z.uuid(),
  amount: z.number().int().positive(),
});

const entrySchema = z.object({
  accountId: z.uuid(),
  direction: MoneyDirectionSchema,
  amount: z.number().int(),
});

export const eventResponseSchema = z.object({
  id: z.uuid(),
  type: z.enum(EventTypesEnum),
  occurredAt: z.string(),
  entries: z.array(entrySchema),
});

export type TransferRequest = z.infer<typeof transferRequestSchema>;
export type EventResponse = z.infer<typeof eventResponseSchema>;
