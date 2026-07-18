import { Command } from "commander";
import pc from "picocolors";
import "../effects.js";
import { registerDoctor } from "./cmds/doctor.js";
import { registerDb } from "./cmds/db.js";
import { registerAgent } from "./cmds/agent.js";
import { registerApprove } from "./cmds/approve.js";
import { registerSource } from "./cmds/source.js";
import { registerLeads } from "./cmds/leads.js";
import { registerQueue } from "./cmds/queue.js";
import { registerBusiness } from "./cmds/business.js";
import { registerServe } from "./cmds/serve.js";
import { registerFactory } from "./cmds/factory.js";

/**
 * sarga: the studio's command line. Each phase of the OS registers its
 * commands from its own module under cmds/.
 */

const program = new Command();

program
  .name("sarga")
  .description(
    pc.bold("Sarga Studio OS") +
      " - the operating machine behind the studio.\n" +
      "Draft-only agents, one approval queue, compliant outreach, an MVP factory.",
  )
  .version("0.1.0");

registerDoctor(program);
registerDb(program);
registerAgent(program);
registerApprove(program);
registerSource(program);
registerLeads(program);
registerQueue(program);
registerBusiness(program);
registerServe(program);
registerFactory(program);

program.parseAsync(process.argv).catch((err) => {
  console.error(pc.red("sarga failed:"), err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
