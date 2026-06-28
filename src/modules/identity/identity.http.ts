import { Hono } from "hono";
import { validateJSON } from "../../shared/validation.js";
import { createUserRequestSchema } from "./identity.dto.js";

export function IdentityRoutes() {
  const app = new Hono();

  app.get("/", (c) => {
    return c.json({ message: "Identity service is running" });
  });

  app.post("/users", validateJSON(createUserRequestSchema), async (c) => {});

  return app;
}
