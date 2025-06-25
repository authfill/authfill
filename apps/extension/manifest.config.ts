import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";
const { version } = packageJson;

const [major, minor, patch] = version.replace(/[^\d.-]+/g, "").split(/[.-]/);

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: env.mode === "development" ? "[DEV] AuthFill" : "AuthFill",
  version: `${major}.${minor}.${patch}`,
  description: "Verify your email with one click.",
  action: { default_popup: "index.html" },
  background:
    process.env.BROWSER === "firefox"
      ? {
          scripts: ["src/background/index.ts"],
          type: "module",
        }
      : {
          service_worker: "src/background/index.ts",
          type: "module",
        },
  permissions: [
    "storage",
    "tabs",
    "notifications",
    ...(process.env.BROWSER === "firefox" ? ["clipboardWrite"] : []),
  ],
  icons: {
    "16": "public/icons/icon-dark-16x16.png",
    "32": "public/icons/icon-dark-32x32.png",
    "48": "public/icons/icon-dark-48x48.png",
    "128": "public/icons/icon-dark-128x128.png",
  },
  content_security_policy: {
    extension_pages: `script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; connect-src 'self' ${[
      "https://autoconfig.thunderbird.net",
      process.env.PUBLIC_WSS_URL,
      process.env.PUBLIC_PROXY_URL,
      ...(env.mode === "development"
        ? [
            process.env.PUBLIC_EXTENSION_URL,
            process.env.PUBLIC_EXTENSION_WS_URL,
          ]
        : []),
    ]
      .filter(Boolean)
      .join(" ")}`,
  },
  host_permissions:
    env.mode == "development" ? [`${process.env.PUBLIC_EXTENSION_URL}/*`] : [],
  ...(process.env.BROWSER === "firefox"
    ? {
        browser_specific_settings: {
          gecko: {
            id: "extension@authfill.com",
          },
        },
      }
    : {}),
}));
