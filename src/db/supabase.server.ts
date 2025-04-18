import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "./database.types.ts";

// Define the expected shape of the runtime environment object
// Adjust this based on the actual variables you set in Cloudflare
interface RuntimeEnv {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  // Add other env variables used by the server if any
}

export const cookieOptions: CookieOptionsWithName = {
  name: "sb-auth",
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

// Update function signature to accept runtimeEnv
export const createSupabaseServerInstance = (context: {
  headers: Headers;
  cookies: AstroCookies;
  runtimeEnv: RuntimeEnv; // Add runtimeEnv to the expected context
}) => {
  // Read URL and Key from the passed runtimeEnv
  const supabaseUrl = context.runtimeEnv.SUPABASE_URL;
  const supabaseKey = context.runtimeEnv.SUPABASE_KEY;

  // Throw an error if variables are missing (better visibility than Supabase internal error)
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_KEY in Cloudflare runtime environment.");
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
