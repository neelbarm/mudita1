import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import type { Json } from "../../os/store/types.js";
import type { RawRecord, SourceConnector } from "./types.js";

/**
 * CSV import: the always-available, key-free source. One row per
 * company or person. Recognized headers (case-insensitive):
 *   company, domain, url, geo, full_name, role, email, linkedin_url
 * Rows with full_name become person records; the rest become
 * companies. Everything still lands as candidates behind the gate.
 */
export class CsvConnector implements SourceConnector {
  readonly kind = "csv_import" as const;
  readonly provider = "csv";

  async *discover(query: Json): AsyncGenerator<RawRecord> {
    const file = String(query.file);
    const rows = parse(readFileSync(file, "utf8"), {
      columns: (h: string[]) => h.map((c) => c.trim().toLowerCase()),
      skip_empty_lines: true,
      trim: true,
    }) as Record<string, string>[];

    for (const row of rows) {
      const company = row.company ?? row.name ?? "";
      if (row.full_name) {
        yield {
          kind: "person",
          full_name: row.full_name,
          role: row.role || null,
          email: row.email || null,
          linkedin_url: row.linkedin_url || null,
          company: company || null,
          domain: row.domain || null,
          provenance: { imported_from: file },
        };
      }
      if (company) {
        yield {
          kind: "company",
          name: company,
          domain: row.domain || null,
          url: row.url || null,
          geo: row.geo || null,
        };
      }
    }
  }
}
