import { Elysia } from "elysia";
import { auth } from "@/lib/auth";
import { RPCHandler } from "@orpc/server/fetch";
import { appRouter } from "./orpc/routers";
import { onError } from "@orpc/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { cors } from "@elysiajs/cors";
import { createContext } from "./orpc/context";

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const app = new Elysia();
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  );
  app.all("/api/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  });
  app.all("/rpc*", async (context) => {
    const { response } = await rpcHandler.handle(context.request, {
      prefix: "/rpc",
      context: await createContext({ context }),
    });
    return response ?? new Response("Not Found", { status: 404 });
  });
  app.all("/api*", async (context) => {
    const { response } = await apiHandler.handle(context.request, {
      prefix: "/api-reference",
      context: await createContext({ context }),
    });
    return response ?? new Response("Not Found", { status: 404 });
  });
  app.get("/", () => "OK");

export default app;
