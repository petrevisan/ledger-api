import { Hono } from "hono";
import { validateJSON } from "../../../shared/validation.js";

export function TransactionsRoutes() {
  const app = new Hono();

  app.get("/", (c) => {
    return c.json({ message: "Transactions service is running" });
  });

  return app;
}
