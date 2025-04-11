import { z } from "zod";
import type { APIRoute } from "astro";
import { generationService } from "../../lib/services";
import type { GenerateFlashcardsCommand } from "../../types";
import { AIBaseError, errorStatusMap } from "../../lib/errors/generation.errors";

// Schema for validating the request body
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Source text must be at least 1000 characters")
    .max(10000, "Source text must be at most 10000 characters"),
});

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Step 1: Extract and validate the request body
  let requestData: GenerateFlashcardsCommand;

  try {
    const body = await request.json();
    const result = generateFlashcardsSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request body",
          details: result.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    requestData = result.data;
  } catch (error) {
    console.error("Error parsing request body:", error);
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Step 2: Process the generation request
  try {
    const supabase = locals.supabase;
    const generationResult = await generationService.generateFlashcards(requestData.source_text, supabase);

    // Step 3: Return the successful response
    return new Response(JSON.stringify(generationResult), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error during flashcard generation:", error);

    // Step 4: Handle and return appropriate error responses
    if (error instanceof AIBaseError) {
      // Use our error-to-status mapping
      const errorName = error.constructor.name;
      const status = errorStatusMap[errorName as keyof typeof errorStatusMap] || 500;

      return new Response(JSON.stringify({ error: error.message || "An error occurred" }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generic server error for unhandled exceptions
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
