import type { APIRoute } from "astro";
import { z } from "zod";

// Define schema for input validation
const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

// Friendly error messages for Supabase errors
const errorMessages: Record<string, string> = {
  "User already registered": "An account with this email already exists",
  "Email rate limit exceeded": "Too many sign up attempts. Please try again later",
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.error.errors[0]?.message || "Invalid input",
        }),
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Use supabase instance from locals (created by middleware)
    const supabase = locals.supabase;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      const userFriendlyMessage = errorMessages[error.message] || error.message;
      return new Response(JSON.stringify({ error: userFriendlyMessage }), { status: 400 });
    }

    // Return user data
    return new Response(
      JSON.stringify({
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
        redirectTo: "/generate",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return new Response(JSON.stringify({ error: "An unexpected error occurred. Please try again." }), { status: 500 });
  }
};
