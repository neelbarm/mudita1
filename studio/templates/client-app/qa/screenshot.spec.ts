import { mkdirSync } from "node:fs";
import { test } from "@playwright/test";
import spec from "../src/design/spec.json" with { type: "json" };

/**
 * Screenshot pass: every route in the spec at desktop and phone.
 * The Designer-critic scores these images against the craft rubric.
 */

const routes: string[] = Array.from(
  new Set([
    "/",
    ...((spec.sections as Array<{ route?: string }> | null) ?? [])
      .map((s) => s.route)
      .filter((r): r is string => Boolean(r)),
  ]),
);

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "phone", width: 390, height: 844 },
];

mkdirSync("qa/screens", { recursive: true });

for (const route of routes) {
  for (const vp of VIEWPORTS) {
    test(`${route} @ ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route, { waitUntil: "networkidle" });
      await page.waitForTimeout(600);
      const slug = route === "/" ? "home" : route.replace(/\//g, "_");
      await page.screenshot({ path: `qa/screens/${slug}-${vp.name}.png`, fullPage: true });
    });
  }
}
