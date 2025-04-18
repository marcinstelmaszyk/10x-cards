import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "../db/supabase.server.ts";

// Public paths - Auth API endpoints & Server-Rendered Astro Pages
const PUBLIC_PATHS = [
  // Server-Rendered Astro Pages
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/reset-password",
  // Public paths
  "/",
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  // Get the runtime environment (contains secrets like SUPABASE_URL, SUPABASE_KEY)
  const runtimeEnv = locals.runtime?.env;

  // Check if runtimeEnv is available
  if (!runtimeEnv) {
    console.error("Cloudflare runtime environment not found in locals!");
    // You might want to throw an error or return a specific response here
    // depending on how critical this is.
    return new Response("Internal Server Error: Missing runtime environment", { status: 500 });
  }

  // Create server-side Supabase client, passing the runtime environment
  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
    runtimeEnv: runtimeEnv, // Pass the runtime env here
  });

  // Add supabase to locals for use in API routes
  locals.supabase = supabase;

  // Skip auth check for public paths
  if (PUBLIC_PATHS.includes(url.pathname)) {
    return next();
  }

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    locals.user = {
      id: user.id,
      email: user.email,
    };
  } else if (!PUBLIC_PATHS.includes(url.pathname)) {
    // Redirect to login for protected routes
    return redirect("/auth/login");
  }

  return next();
});
