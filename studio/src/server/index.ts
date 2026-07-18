import { serve } from "@hono/node-server";
import { cfg } from "../os/config.js";
import { log } from "../os/log.js";
import { buildApp } from "./app.js";

const app = buildApp();

serve({ fetch: app.fetch, port: cfg.port }, (info) => {
  log.ok(`studio server listening on :${info.port}`);
  log.info(`health:   GET  http://localhost:${info.port}/health`);
  log.info(`doctor:   GET  http://localhost:${info.port}/doctor`);
  log.info(`queue:    GET  http://localhost:${info.port}/approvals`);
});
