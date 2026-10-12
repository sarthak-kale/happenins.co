import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globalSetup: ["tests/support/global-setup.ts"],
    setupFiles: ["tests/support/setup.ts"],
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});
