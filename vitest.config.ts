import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@clerk/nextjs/server": path.resolve(__dirname, "src/test/clerk-stub.ts"), "@": path.resolve(__dirname, "src") } },
  test: { env: { DATABASE_URL: "file::memory:" } },
});
