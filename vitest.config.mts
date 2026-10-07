import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pruebas de la lógica (lib/). Se corren con `npm test`.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    include: ["lib/**/*.test.ts"],
  },
});
