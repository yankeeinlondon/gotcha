import { defineConfig } from "vitest/config";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

// Resolve the directory name for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"), // Map "~/" to "./src"
    },
  },
  test: {
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules/**",
        "tests/**",
        "**/*.config.*",
        "**/*.d.ts"
      ]
    }
  },
});
