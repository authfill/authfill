// app.config.ts
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import { config } from "dotenv";
import { cloudflare } from "unenv";
import alias from "vite-tsconfig-paths";

config({ path: "../../.env" });

export default defineConfig({
  vite: {
    plugins: [alias(), tailwindcss(), mdx()],
    envPrefix: ["PUBLIC_"],
  },
  server: {
    preset: "cloudflare-pages",
    unenv: cloudflare,
  },
});
