import { defineConfig } from "cf/config";

export default defineConfig({
  worker: {
    name: "just-invoicing-things",
    compatibilityDate: "2026-10-29",
    compatibilityFlags: ["nodejs_compat"],
    entrypoint: "@tanstack/react-start/server-entry",
    domains: ["finance.ruxera.com"],
  },
});
