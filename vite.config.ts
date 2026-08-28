import { defineConfig } from "vite";
export default defineConfig({
  base: "/shell-context-demo/",
  server: { port: 5175 },
  build: { outDir: "dist", emptyOutDir: true },
});

