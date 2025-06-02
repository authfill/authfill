import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";
const { version } = packageJson;

const [major, minor, patch, label = "0"] = version
  .replace(/[^\d.-]+/g, "")
  .split(/[.-]/);

export default defineManifest(async (env) => ({
  manifest_version: 3,
  name: env.mode === "development" ? "[DEV] AuthFill" : "AuthFill",
  version: `${major}.${minor}.${patch}.${label}`,
  version_name: version,
  description: "Verify your email with zero clicks.",
  action: { default_popup: "index.html" },
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  permissions: [
    "storage",
    "activeTab",
    "tabs",
    "clipboardWrite",
    "notifications",
  ],
  icons: {
    "16": "public/icons/icon-dark-16x16.png",
    "32": "public/icons/icon-dark-32x32.png",
    "48": "public/icons/icon-dark-48x48.png",
    "128": "public/icons/icon-dark-128x128.png",
  },
  externally_connectable: {
    matches: ["https://*.authfill.com/*", "http://localhost:3000/*"],
  },
  content_security_policy: {
    extension_pages: `script-src 'self' 'wasm-unsafe-eval'; object-src 'self'; connect-src 'self' ws://localhost:3001 https://autoconfig.thunderbird.net https://gmail.googleapis.com/ ${process.env.PUBLIC_WSS_URL} ${process.env.PUBLIC_EXTENSION_URL} ${process.env.PUBLIC_PROXY_URL}`,
  },
  host_permissions:
    env.mode == "development" ? [`${process.env.PUBLIC_EXTENSION_URL}/*`] : [],
}));
