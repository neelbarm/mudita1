import type { Command } from "commander";
import pc from "picocolors";
import { CsvConnector } from "../../leads/sourcing/csv.js";
import { runSourceJob } from "../../leads/sourcing/run.js";
import { enrichAccount } from "../../leads/enrich.js";

export function registerSource(program: Command) {
  const source = program.command("source").description("Source raw lead candidates. Everything lands behind the human gate.");

  source
    .command("csv <file>")
    .description("Import companies and people from a CSV (headers: company, domain, url, geo, full_name, role, email, linkedin_url).")
    .action(async (file: string) => {
      const { fresh, duplicates, approval } = await runSourceJob(new CsvConnector(), { file });
      console.log(pc.green(`${fresh} fresh records (${duplicates} duplicates skipped).`));
      if (approval) console.log(pc.yellow(`queued: ${approval.title}`));
    });

  source
    .command("site-signals <domain>")
    .description("Crawl a company's own public pages for typed signals (Hyperbrowser).")
    .action(async (domain: string) => {
      const { SiteSignalsConnector } = await import("../../leads/sourcing/hyperbrowser/site-signals.js");
      const { fresh, approval } = await runSourceJob(new SiteSignalsConnector(), { domain });
      console.log(pc.green(`${fresh} signals landed.`));
      if (approval) console.log(pc.yellow(`queued: ${approval.title}`));
    });

  source
    .command("directory <url>")
    .description("Scrape a public directory or roundup page for companies (Hyperbrowser).")
    .option("--geo <geo>", "geo tag for every company found")
    .action(async (url: string, opts: { geo?: string }) => {
      const { DirectoryConnector } = await import("../../leads/sourcing/hyperbrowser/directories.js");
      const { fresh, duplicates, approval } = await runSourceJob(new DirectoryConnector(), { url, geo: opts.geo ?? null });
      console.log(pc.green(`${fresh} fresh companies (${duplicates} duplicates).`));
      if (approval) console.log(pc.yellow(`queued: ${approval.title}`));
    });

  source
    .command("maps <query>")
    .description("Google Maps research aid. Requires --i-understand-tos; never scheduled.")
    .option("--geo <geo>")
    .option("--i-understand-tos", "acknowledge that scraping Maps may violate Google's terms; prefer the Places API or licensed data")
    .action(async (query: string, opts: { geo?: string; iUnderstandTos?: boolean }) => {
      if (!opts.iUnderstandTos) {
        console.error(pc.red("refused: maps sourcing needs --i-understand-tos."));
        console.error(pc.dim("The studio's published posture is licensed data and first-party pages. Use this only as a manual research aid."));
        process.exitCode = 1;
        return;
      }
      const { MapsConnector } = await import("../../leads/sourcing/hyperbrowser/maps.js");
      const { fresh, approval } = await runSourceJob(new MapsConnector(), {
        q: query,
        geo: opts.geo ?? null,
        acknowledged_tos: true,
      });
      console.log(pc.green(`${fresh} candidates landed (behind the gate, like everything).`));
      if (approval) console.log(pc.yellow(`queued: ${approval.title}`));
    });

  source
    .command("enrich <accountId>")
    .description("Find and verify decision-maker contacts via the licensed provider.")
    .action(async (accountId: string) => {
      const { found, verified } = await enrichAccount(accountId);
      console.log(pc.green(`${found} new contacts, ${verified} verified addresses.`));
    });
}
