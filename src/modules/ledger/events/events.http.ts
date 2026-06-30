import { Hono } from "hono";
import { idempotency } from "../../../shared/middlewares/idempotency.js";
import { validateJSON } from "../../../shared/validation.js";
import { transferRequestSchema } from "./events.dto.js";
import { EventsService } from "./events.service.js";

export function EventsRoutes() {
  const app = new Hono();
  const service = new EventsService();

  app.post(
    "/transfers",
    idempotency,
    validateJSON(transferRequestSchema),
    async (c) => {
      const input = c.req.valid("json");
      const event = await service.transfer(input);
      return c.json(event, 201);
    },
  );

  return app;
}
