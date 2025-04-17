import crypto from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { FlashcardProposalDto, GenerationCreateResponseDto } from "../../types";
import { AIServiceError, DatabaseError } from "../errors/generation.errors";
import { createOpenRouterService } from "./openrouter.service";

/**
 * Service responsible for handling the generation of flashcards using AI
 * and storing the generation metadata in the database.
 */
class GenerationService {
  /**
   * Generate flashcard proposals using AI based on the provided source text
   *
   * @param sourceText The text to generate flashcards from (1000-10000 characters)
   * @param supabaseClient The Supabase client to use for database operations
   * @param userId The ID of the authenticated user
   * @returns A response object containing the generation ID, flashcard proposals, and count
   */
  async generateFlashcards(
    sourceText: string,
    supabaseClient: SupabaseClient,
    userId: string
  ): Promise<GenerationCreateResponseDto> {
    try {
      // Step 1: Calculate metadata for the generation
      const startTime = Date.now();
      const sourceTextHash = this.calculateSourceTextHash(sourceText);
      const sourceTextLength = sourceText.length;

      // Step 2: Call the AI service to generate flashcard proposals (using OpenRouter)
      const flashcardProposals = await this.callAIService(sourceText, userId);
      const generatedCount = flashcardProposals.length;
      const endTime = Date.now();
      const generationDuration = endTime - startTime;

      // Step 3: Save the generation metadata to the database
      const { data: generationData, error: generationError } = await supabaseClient
        .from("generations")
        .insert({
          model: "mistralai/mistral-7b-instruct:free", // Using the default OpenRouter model
          generated_count: generatedCount,
          source_text_hash: sourceTextHash,
          source_text_length: sourceTextLength,
          generation_duration: generationDuration,
          user_id: userId, // Use provided user ID
        })
        .select("id")
        .single();

      if (generationError) {
        console.error("Error inserting generation:", generationError);
        await this.logGenerationError(
          supabaseClient,
          "DB_INSERT_ERROR",
          generationError.message,
          "mistralai/mistral-7b-instruct:free",
          sourceTextHash,
          sourceTextLength,
          userId
        );
        throw new DatabaseError("Failed to save generation metadata");
      }

      // Step 4: Return the response with generation ID and flashcard proposals
      return {
        generation_id: generationData.id,
        flashcards_proposals: flashcardProposals,
        generated_count: generatedCount,
      };
    } catch (error) {
      // If it's already one of our custom errors, rethrow it
      if (error instanceof AIServiceError || error instanceof DatabaseError) {
        throw error;
      }

      // Otherwise, log and throw a generic error
      console.error("Unexpected error during flashcard generation:", error);
      throw new Error("Unexpected error during flashcard generation");
    }
  }

  /**
   * Calculate a MD5 hash of the source text
   */
  private calculateSourceTextHash(sourceText: string): string {
    return crypto.createHash("md5").update(sourceText).digest("hex");
  }

  /**
   * Call the OpenRouter AI service to generate flashcard proposals
   */
  private async callAIService(sourceText: string, userId?: string): Promise<FlashcardProposalDto[]> {
    try {
      // Create OpenRouter service instance
      const openRouter = createOpenRouterService();

      // Configure the system prompt
      const systemPrompt = `You are a specialized AI designed to create educational flashcards from text.
Your task is to analyze the provided text and create concise, effective flashcards that capture the key concepts, facts, and relationships.

Guidelines for creating good flashcards:
1. Each flashcard should focus on a single concept, fact, or relationship
2. The front should contain a clear, specific question or prompt
3. The back should provide a concise but complete answer or explanation
4. Questions should test understanding, not just recall of terms
5. Create between 3-10 flashcards depending on the content density

You MUST return your response as a valid JSON object with a 'flashcards' array containing objects with 'front' and 'back' fields.`;

      // Configure the user prompt with the source text
      const userPrompt = `Please create flashcards from the following text:\n\n${sourceText}`;

      // Set up OpenRouter for the request
      openRouter.setSystemMessage(systemPrompt);
      openRouter.setResponseFormat({
        name: "flashcards",
        schema: {
          type: "object",
          properties: {
            flashcards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  front: { type: "string" },
                  back: { type: "string" },
                },
                required: ["front", "back"],
              },
            },
          },
          required: ["flashcards"],
        },
      });

      // Send the request and get the response
      const response = await openRouter.sendChatMessage<{ flashcards: { front: string; back: string }[] }>(userPrompt);

      // Convert the response to FlashcardProposalDto format
      const proposals: FlashcardProposalDto[] = response.flashcards.map((card) => ({
        front: card.front,
        back: card.back,
        source: "ai-full",
      }));

      return proposals;
    } catch (error) {
      // Log the error and rethrow as an AIServiceError
      console.error("Error calling OpenRouter service:", error);

      await this.logGenerationError(
        null, // No supabase client needed at this point
        "AI_SERVICE_ERROR",
        error instanceof Error ? error.message : "Unknown AI service error",
        "mistralai/mistral-7b-instruct:free",
        this.calculateSourceTextHash(sourceText),
        sourceText.length,
        userId
      );

      throw new AIServiceError("Failed to generate flashcards with AI service");
    }
  }

  /**
   * Log an error that occurred during the generation process
   */
  private async logGenerationError(
    supabaseClient: SupabaseClient | null,
    errorCode: string,
    errorMessage: string,
    model: string,
    sourceTextHash: string,
    sourceTextLength: number,
    userId?: string
  ): Promise<void> {
    // In mock mode, just log to console
    if (!supabaseClient) {
      console.error(`[${errorCode}] ${errorMessage} (Model: ${model})`);
      return;
    }

    // In real mode, log to the database
    try {
      const { error } = await supabaseClient.from("generation_error_logs").insert({
        error_code: errorCode,
        error_message: errorMessage,
        model: model,
        source_text_hash: sourceTextHash,
        source_text_length: sourceTextLength,
        user_id: userId || "", // Provide empty string fallback when userId is undefined
      });

      if (error) {
        console.error("Error logging generation error:", error);
      }
    } catch (error) {
      console.error("Failed to log generation error:", error);
    }
  }
}

export const generationService = new GenerationService();
