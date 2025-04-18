// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  site: "https://10x-cards-prod.pages.dev",
  adapter: cloudflare(),
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  experimental: {
    session: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
