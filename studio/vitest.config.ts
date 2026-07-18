import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Simulations and the factory shell out; unit tests stay fast.
    testTimeout: 30_000,
    // Each test file gets a clean LocalStore under .local/test/.
    isolate: true,
  },
});
