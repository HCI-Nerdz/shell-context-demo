import { defineConfig } from "vite";
export default defineConfig({ base: "/demos/shell-context/", server: { port: 5175 }, build: { outDir: "dist", emptyOutDir: true } });
