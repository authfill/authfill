// app.config.ts
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "@tanstack/react-start/config";
import { config } from "dotenv";
import alias from "vite-tsconfig-paths";

config({ path: "../../.env" });

export default defineConfig({
  vite: {
    plugins: [alias(), tailwindcss()],
    envPrefix: ["PUBLIC_"],
  },
});
