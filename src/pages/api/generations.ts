import type { APIRoute } from "astro";
import { z } from "zod";
// Removed direct import of supabase client
// import { supabase } from "../../db/supabase";
import type { GenerateFlashcardsCommand } from "../../types";
import { generationService } from "../../lib/services/generation.service"; // Import generation service

// Ensure endpoint is treated as dynamic
export const prerender = false;

// Zod schema for input validation
const GenerateCommandSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters.")
    .max(10000, "Source text must not exceed 10000 characters."),
});

// Updated signature to include locals
export const POST: APIRoute = async ({ request, locals }) => {
  // Access supabase client from locals
  const supabase = locals.supabase;

  // Check if supabase client exists on locals (from middleware)
  if (!supabase) {
    console.error("Supabase client not found on locals object.");
    return new Response(JSON.stringify({ message: "Internal server configuration error." }), { status: 500 });
  }

  // Placeholder for user ID - replace with actual auth logic later
  // const user = locals.user; // Assuming user might also be on locals

  let command: GenerateFlashcardsCommand;
  try {
    const body = await request.json();
    command = GenerateCommandSchema.parse(body);
  } catch (error) {
    let message = "Invalid request body.";
    if (error instanceof z.ZodError) {
      message = error.errors.map((e) => e.message).join(". ");
    } else if (error instanceof Error) {
      message = error.message;
    }
    return new Response(JSON.stringify({ message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  try {
    // Call the actual generation service instead of using mocks
    console.log(`Processing AI generation for text length: ${command.source_text.length}`);

    // Check if user is authenticated
    if (!locals.user) {
      return new Response(JSON.stringify({ message: "Authentication required. Please log in." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generate flashcards using the generation service
    const responsePayload = await generationService.generateFlashcards(command.source_text, supabase, locals.user.id);

    return new Response(JSON.stringify(responsePayload), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error during generation process:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    // TODO: Log to generation_error_logs table?
    return new Response(JSON.stringify({ message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
