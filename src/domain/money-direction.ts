import { z } from "zod";

export const MoneyDirectionSchema = z.enum(["debit", "credit"]);

export type MoneyDirection = z.infer<typeof MoneyDirectionSchema>;
