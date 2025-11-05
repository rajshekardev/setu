import { Elysia, Context } from "elysia";
import { message } from "~/test";
import { auth } from "~/lib/auth";

const betterAuthView = (context: Context) => {
  const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"];
  if (BETTER_AUTH_ACCEPT_METHODS.includes(context.request.method)) {
    return auth.handler(context.request);
  } else {
    context.status("Method Not Allowed");
  }
};
const ver = process.versions?.bun ?? "unknown";
const app = new Elysia()
  .all("/api/auth/*", betterAuthView)
  .get("/", () => message)
  .get("/version", () => ver);

export default app;
