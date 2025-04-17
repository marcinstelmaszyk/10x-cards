import type { APIRoute } from "astro";
import { z } from "zod";
// Removed direct import of supabase client
// import { supabase } from "../../db/supabase";
import type { FlashcardsCreateCommand, Source, FlashcardDto } from "../../types";

// Ensure endpoint is treated as dynamic
export const prerender = false;

// Validation constants
const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

// Zod schema for a single FlashcardCreateDto
const FlashcardCreateSchema = z
  .object({
    front: z
      .string()
      .min(1, "Front cannot be empty.")
      .max(MAX_FRONT_LENGTH, `Front cannot exceed ${MAX_FRONT_LENGTH} characters.`),
    back: z
      .string()
      .min(1, "Back cannot be empty.")
      .max(MAX_BACK_LENGTH, `Back cannot exceed ${MAX_BACK_LENGTH} characters.`),
    source: z.enum(["ai-full", "ai-edited", "manual"]),
    generation_id: z.number().int().positive().nullable(),
  })
  .refine(
    (data) => {
      // generation_id is required for ai-full and ai-edited
      if ((data.source === "ai-full" || data.source === "ai-edited") && data.generation_id === null) {
        return false;
      }
      // generation_id must be null for manual
      if (data.source === "manual" && data.generation_id !== null) {
        return false;
      }
      return true;
    },
    {
      message:
        "generation_id must be provided for source 'ai-full' or 'ai-edited', and must be null for source 'manual'.",
      // You might want to specify paths for more granular errors, but a general message is often sufficient
    }
  );

// Zod schema for the overall command containing the array
const FlashcardsCreateCommandSchema = z.object({
  flashcards: z.array(FlashcardCreateSchema).min(1, "At least one flashcard must be provided."),
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

  // TODO: Implement proper authentication check later
  // const user = locals.user; // Assuming user might also be on locals
  // Removed placeholder constant
  // const userIdPlaceholder = "user-placeholder-id"; // Placeholder

  let command: FlashcardsCreateCommand;
  try {
    const body = await request.json();
    command = FlashcardsCreateCommandSchema.parse(body);
  } catch (error) {
    let message = "Invalid request body.";
    if (error instanceof z.ZodError) {
      // Combine all error messages
      message = error.errors.map((e) => `${e.path.join(".") || "flashcard"}: ${e.message}`).join("; ");
    } else if (error instanceof Error) {
      message = error.message; // Handle JSON parsing errors
    }
    return new Response(JSON.stringify({ message }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  try {
    // Check if user is authenticated
    if (!locals.user) {
      return new Response(JSON.stringify({ message: "Authentication required. Please log in." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Store user in a local variable to satisfy the type checker
    const user = locals.user;

    // Prepare data for batch insert - adding user_id
    const flashcardsToInsert = command.flashcards.map((fc) => ({
      ...fc,
      user_id: user.id, // Use actual user ID from locals
    }));

    // Using locals.supabase instead of imported client
    const { data: insertedFlashcards, error: dbError } = await supabase
      .from("flashcards")
      .insert(flashcardsToInsert)
      .select(); // Select all columns of the inserted rows

    if (dbError) {
      console.error("Database error inserting flashcards:", dbError);
      // TODO: Add more specific error handling based on dbError.code if needed
      return new Response(
        JSON.stringify({ message: "Failed to save flashcards to database.", details: dbError.message }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!insertedFlashcards || insertedFlashcards.length !== command.flashcards.length) {
      console.error("Mismatch between requested inserts and returned data.");
      return new Response(
        JSON.stringify({ message: "An error occurred during saving, not all flashcards might have been saved." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Map the inserted data back to FlashcardDto for the response
    // This ensures we only return fields defined in FlashcardDto
    const responseData: FlashcardDto[] = insertedFlashcards.map((fc) => ({
      id: fc.id,
      front: fc.front,
      back: fc.back,
      source: fc.source as Source, // Assert type based on successful insert
      generation_id: fc.generation_id,
      created_at: fc.created_at,
      updated_at: fc.updated_at,
      // Note: user_id is intentionally excluded from the response DTO
    }));

    return new Response(JSON.stringify({ flashcards: responseData }), {
      status: 201, // 201 Created for successful resource creation
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error during flashcard save process:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return new Response(JSON.stringify({ message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
