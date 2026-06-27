import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { DomainError } from "../../domain/error.js";

export const errorHandler = (error: Error, c: Context) => {
  if (error instanceof HTTPException) {
    return c.json(
      {
        status: "error",
        message: error.message,
      },
      error.status,
    );
  }

  if (error instanceof DomainError) {
    const response = {
      status: "error" as const,
      message: error.message,
      type: error.name,
    };
    return c.json(response, error.statusCode as any);
  }

  // Handle validation errors from Zod (via @hono/zod-validator)
  if (error.name === "ZodError") {
    return c.json(
      {
        status: "error",
        message: "Validation failed",
        errors: (error as any).errors,
      },
      400,
    );
  }

  // Log unexpected errors for debugging
  console.error("Unexpected error:", {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });

  // Return generic error response for unexpected errors
  return c.json(
    {
      status: "error",
      message: "Internal server error",
    },
    500,
  );
};
