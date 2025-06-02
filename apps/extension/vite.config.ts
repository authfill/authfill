import { crx } from "@crxjs/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { TanStackRouterVite as router } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { config } from "dotenv";
import { defineConfig } from "vite";
import alias from "vite-tsconfig-paths";
import manifest from "./manifest.json";

config({ path: "../../.env" });

export default defineConfig(({ mode }) => ({
  plugins: [
    router({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
    alias(),
    crx({
      manifest: {
        ...manifest,
        host_permissions: [
          mode == "development"
            ? `${process.env.PUBLIC_EXTENSION_URL}/*`
            : null,
          `${process.env.PUBLIC_PROXY_URL}/*`,
          "https://gmail.googleapis.com/*",
        ].filter(Boolean) as string[],
      },
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
}));
