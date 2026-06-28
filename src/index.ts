import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { errorHandler } from "./shared/middlewares/error-handler.js";
import { IdentityRoutes } from "./modules/identity/identity.http.js";

const app = new Hono();

app.use("*", secureHeaders());

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.route("/identity", IdentityRoutes());

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
