import { expect, test } from "@playwright/test";

/**
 * Performance gate (docs/06 §12): LCP under 2.5s on a throttled ~4G
 * connection, measured via CDP on the production build.
 */
test("LCP under 2.5s on throttled 4G", async ({ page, browser }) => {
  const client = await page.context().newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 60,
    downloadThroughput: (9 * 1024 * 1024) / 8,
    uploadThroughput: (3 * 1024 * 1024) / 8,
  });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 2 });

  await page.goto("/", { waitUntil: "load" });
  const lcp = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let value = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) value = entry.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => resolve(value), 3500);
      }),
  );
  console.log(`LCP: ${Math.round(lcp)}ms`);
  expect(lcp).toBeGreaterThan(0);
  expect(lcp).toBeLessThan(2500);
});
