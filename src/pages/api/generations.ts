import type { APIRoute } from "astro";
import { z } from "zod";
// Removed direct import of supabase client
// import { supabase } from "../../db/supabase";
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto, FlashcardProposalDto } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client"; // Import DEFAULT_USER_ID

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

  const startTime = performance.now(); // Start timing

  try {
    // --- Placeholder for actual AI Generation Logic ---
    console.log(`Simulating AI generation for text length: ${command.source_text.length}`);
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate delay

    const mockProposals: FlashcardProposalDto[] = [
      { front: "Mock Proposal 1 - Front", back: "Mock Proposal 1 - Back", source: "ai-full" },
      {
        front: "Mock Proposal 2 - Front (longer text to test wrapping and display)",
        back: "Mock Proposal 2 - Back (with more details)",
        source: "ai-full",
      },
      {
        front: `From text starting: ${command.source_text.substring(0, 50)}...`,
        back: `Based on text ending: ...${command.source_text.substring(command.source_text.length - 50)}`,
        source: "ai-full",
      },
    ];
    // --- End Placeholder ---

    const endTime = performance.now(); // End timing
    const generationDuration = Math.round(endTime - startTime); // Duration in milliseconds

    // Using locals.supabase instead of imported client
    const { data: generationRecord, error: dbError } = await supabase
      .from("generations")
      .insert({
        user_id: DEFAULT_USER_ID,
        source_text_hash: "mock-hash", // TODO: Implement hashing
        source_text_length: command.source_text.length,
        generated_count: mockProposals.length,
        model: "mock-model-v1",
        generation_duration: generationDuration, // Add duration
        // Setting placeholders/defaults for potentially required fields
        accepted_edited_count: 0,
        accepted_unedited_count: 0,
        // prompt_tokens, completion_tokens, cost can be null or added if tracked
      })
      .select("id")
      .single();

    if (dbError || !generationRecord) {
      console.error("Database error saving generation:", dbError);
      return new Response(JSON.stringify({ message: "Failed to save generation record." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const responsePayload: GenerationCreateResponseDto = {
      generation_id: generationRecord.id,
      flashcards_proposals: mockProposals,
      generated_count: mockProposals.length,
    };

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
