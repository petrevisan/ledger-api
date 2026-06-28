import { z } from "zod";

// documentar aqui as decisoes de criar conta e user 1:1 para simplificar, devido ao foco no sistema
// de ledger em si, e nao na questao de identidade/usuarios

export const createUserRequestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.email("Invalid email address"),
  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters long"),
});

export const createUserResponseSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  accountData: z.object({
    accountId: z.uuid(),
    currency: z.literal("BRL"),
    balance: z.number(),
  }),
});

export type CreateUserRequest = z.infer<typeof createUserRequestSchema>;
export type UserResponse = z.infer<typeof createUserResponseSchema>;
