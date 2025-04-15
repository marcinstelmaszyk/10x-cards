import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.server.ts";
import { z } from "zod";

// Define schema for input validation
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Friendly error messages for Supabase errors
const errorMessages: Record<string, string> = {
  "Invalid login credentials": "The email or password you entered is incorrect",
  "Email not confirmed": "Please confirm your email address before logging in",
  "Invalid email or password": "The email or password you entered is incorrect",
  "Too many requests": "Too many login attempts. Please try again later",
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    // Validate input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.errors[0]?.message || "Invalid input",
        }),
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const userFriendlyMessage = errorMessages[error.message] || error.message;
      return new Response(JSON.stringify({ error: userFriendlyMessage }), { status: 400 });
    }

    // Redirect on successful login
    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        redirectTo: "/generate",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Login error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), { status: 500 });
  }
};
