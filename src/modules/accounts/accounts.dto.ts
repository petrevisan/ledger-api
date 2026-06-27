import { z } from "zod";

export const createAccountSchema = z.object({});
export const accountResponseSchema = z.object({});

export type CreateAccountRequest = z.infer<typeof createAccountSchema>;
export type AccountResponse = z.infer<typeof accountResponseSchema>;
