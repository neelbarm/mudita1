import { Command } from "commander";
import pc from "picocolors";
import { registerDoctor } from "./cmds/doctor.js";

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

program.parseAsync(process.argv).catch((err) => {
  console.error(pc.red("sarga failed:"), err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
