import { Elysia } from "elysia";
import { message } from "./test";

const app = new Elysia().get("/", () => message);
console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

export default app;
