import type { Command } from "commander";
import { serve } from "@hono/node-server";
import { cfg } from "../../os/config.js";
import { log } from "../../os/log.js";
import { buildApp } from "../../server/app.js";

export function registerServe(program: Command) {
  program
    .command("serve")
    .description("Run the studio HTTP server (what n8n talks to). Headquarters lives at /hq.")
    .option("--port <port>", "override STUDIO_PORT")
    .action((opts: { port?: string }) => {
      const app = buildApp();
      const port = opts.port ? Number(opts.port) : cfg.port;
      serve({ fetch: app.fetch, port }, (info) => {
        log.ok(`studio server listening on :${info.port}`);
        log.brass(`headquarters: http://localhost:${info.port}/hq`);
      });
    });

  program
    .command("hq")
    .description("Open Headquarters: serve the OS and print the deck's address.")
    .option("--port <port>", "override STUDIO_PORT")
    .action((opts: { port?: string }) => {
      const app = buildApp();
      const port = opts.port ? Number(opts.port) : cfg.port;
      serve({ fetch: app.fetch, port }, (info) => {
        log.brass(`headquarters is open: http://localhost:${info.port}/hq`);
        log.info("the room refreshes itself; decisions you make there are recorded as you.");
      });
    });
}
