import type { Context, Next } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { z } from "zod";
import { claim, release, store } from "../idempotency-cache.js";

export async function idempotency(c: Context, next: Next) {
  const idempotencyKey = c.req.header("idempotency-key");

  if (!idempotencyKey) {
    return next();
  }

  if (!z.uuid().safeParse(idempotencyKey).success) {
    return c.json(
      { status: "error", message: "Idempotency-Key must be a valid UUID" },
      400,
    );
  }

  const claimResult = await claim(idempotencyKey);

  if (claimResult.outcome === "cached") {
    return c.json(
      claimResult.response.body,
      claimResult.response.status as ContentfulStatusCode,
    );
  }

  if (claimResult.outcome === "in_progress") {
    return c.json(
      {
        status: "error",
        message: "A request with this Idempotency-Key is already being processed",
      },
      409,
    );
  }

  try {
    await next();
  } catch (error) {
    await release(idempotencyKey);
    throw error;
  }

  const succeeded = c.res.status >= 200 && c.res.status < 300;

  if (succeeded) {
    const responseBody = await c.res.clone().json();
    await store(idempotencyKey, { status: c.res.status, body: responseBody });
  } else {
    await release(idempotencyKey);
  }
}
