import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter as router } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import { defineConfig } from "vite";
import alias from "vite-tsconfig-paths";
import manifest from "./manifest.config";

config({ path: "../../.env" });

export default defineConfig({
  plugins: [
    router({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    alias(),
    crx({
      manifest,
    }),
  ],
  envPrefix: ["PUBLIC_"],
  server: {
    port: 3001,
    strictPort: true,
    hmr: {
      port: 3001,
    },
  },
  legacy: {
    skipWebSocketTokenCheck: true,
  },
});
