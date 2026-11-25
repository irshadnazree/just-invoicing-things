import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "just-invoicing-things",
    compatibilityDate: "2025-09-02",
    compatibilityFlags: ["nodejs_compat"],
    entrypoint: "@tanstack/react-start/server-entry",
    observability: {
      enabled: true,
    },
  },
});
