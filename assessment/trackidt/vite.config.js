import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// Web assembly and await vite plugin config

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "."),
      "./chromaprint_wasm_bg": path.resolve(
        process.cwd(),
        "node_modules/chromaprint-wasm/chromaprint_wasm_bg.wasm",
      ),
    },
  },
  optimizeDeps: { exclude: ["chromaprint-wasm"] },
});
