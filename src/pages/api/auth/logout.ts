import type { APIRoute } from "astro";
// Remove direct import
// import { createSupabaseServerInstance } from "../../../db/supabase.server.ts";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  try {
    // Use supabase from locals
    const supabase = locals.supabase;

    const { error } = await supabase.auth.signOut();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    // Check if the request was a form submission
    const contentType = request.headers.get("content-type") || "";
    const isFormSubmission = contentType.includes("application/x-www-form-urlencoded");

    if (isFormSubmission) {
      // Redirect directly for form submissions
      return redirect("/");
    }

    // Return JSON for API calls
    return new Response(JSON.stringify({ success: true, redirectTo: "/" }), { status: 200 });
  } catch (err) {
    console.error("Logout error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred during logout." }), { status: 500 });
  }
};
