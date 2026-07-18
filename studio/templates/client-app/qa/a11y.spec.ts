import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/** Accessibility gate: serious and critical axe violations fail the build. */
test("home has no serious accessibility violations", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page }).analyze();
  const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));
  for (const v of serious) {
    console.error(`${v.impact}: ${v.id} - ${v.help} (${v.nodes.length} nodes)`);
  }
  expect(serious).toEqual([]);
});
