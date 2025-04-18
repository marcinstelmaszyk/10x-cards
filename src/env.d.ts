/// <reference types="astro/client" />

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./db/database.types.ts";

// Add Runtime type for Cloudflare
type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare global {
  namespace App {
    interface Locals extends Runtime {
      // Extend Locals with Cloudflare Runtime
      supabase: SupabaseClient<Database>;
      user?: {
        id: string;
        email?: string;
      };
    }
  }

  // Define Env for Cloudflare bindings if needed (e.g., KV, secrets)
  // interface Env {
  //   SESSION: KVNamespace;
  //   SUPABASE_URL: string;
  //   SUPABASE_KEY: string;
  // }
}

interface ImportMetaEnv {
  // These are primarily for *public* build-time vars
  // Server-side vars are accessed via context.locals.runtime.env in Cloudflare
  readonly PUBLIC_SUPABASE_URL?: string; // Example if you needed URL client-side
  readonly PUBLIC_SUPABASE_KEY?: string; // Example if you needed Key client-side

  readonly OPENROUTER_API_KEY?: string; // Keep if used during build
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
