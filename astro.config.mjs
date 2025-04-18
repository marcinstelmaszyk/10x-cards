// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// Polyfill code to be injected
const polyfills = `
// Polyfill MessageChannel
if (typeof MessageChannel === 'undefined') {
  class MessagePortPolyfill { postMessage() {} addEventListener() {} removeEventListener() {} dispatchEvent() { return true; } }
  class MessageChannelPolyfill { constructor() { this.port1 = new MessagePortPolyfill(); this.port2 = new MessagePortPolyfill(); } }
  globalThis.MessageChannel = MessageChannelPolyfill;
  globalThis.MessagePort = MessagePortPolyfill;
}
// Define minimal process object
if (typeof process === 'undefined') {
  globalThis.process = { env: { NODE_ENV: 'production' } };
}
`;

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
    build: {
      rollupOptions: {
        output: {
          // Inject the polyfills at the very beginning of the worker bundle
          banner: polyfills,
        },
      },
    },
  },
});
