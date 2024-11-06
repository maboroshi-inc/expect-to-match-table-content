/// <reference types="vitest" />

import { defineConfig } from "vite"

export default defineConfig({
  build: {
    rollupOptions: {
      external: ["vitest", "cli-table3"],
    },
    lib: {
      formats: ["es", "cjs"],
      entry: ["./src/index.ts", "./src/vitest.ts"],
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["./setup-tests.ts"],
  },
})
