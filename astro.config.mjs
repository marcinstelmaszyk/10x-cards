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
  adapter: cloudflare({
    imageService: "compile", // Use compile-time image optimization
  }),
  integrations: [
    react({
      include: ["**/*.tsx", "**/*.jsx"],
    }),
    sitemap(),
  ],
  server: { port: 3000 },
  experimental: {
    session: true, // Keep the default session setting
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["react-dom/server"],
    },
    // Add our polyfill to fix MessageChannel issue
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
    // Add this to ensure our polyfill loads before React
    optimizeDeps: {
      include: ["react", "react-dom"],
    },
    build: {
      rollupOptions: {
        input: {
          polyfills: "./src/polyfills.js",
        },
      },
    },
  },
});
