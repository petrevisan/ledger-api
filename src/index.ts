import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { errorHandler } from "./shared/middlewares/error-handler.js";

const app = new Hono();

app.use("*", secureHeaders());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.onError(errorHandler);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
