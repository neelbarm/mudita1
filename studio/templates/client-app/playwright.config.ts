import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./qa",
  timeout: 60_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:4321",
  },
  webServer: {
    command: "npm run start",
    url: "http://localhost:4321",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
