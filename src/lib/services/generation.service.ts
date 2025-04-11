import crypto from "crypto";
import type { SupabaseClient } from "../../db/supabase.client";
import type { FlashcardProposalDto, GenerationCreateResponseDto } from "../../types";
import { AIServiceError, DatabaseError } from "../errors/generation.errors";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

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
   * @returns A response object containing the generation ID, flashcard proposals, and count
   */
  async generateFlashcards(sourceText: string, supabaseClient: SupabaseClient): Promise<GenerationCreateResponseDto> {
    try {
      // Step 1: Calculate metadata for the generation
      const startTime = Date.now();
      const sourceTextHash = this.calculateSourceTextHash(sourceText);
      const sourceTextLength = sourceText.length;

      // Step 2: Call the AI service to generate flashcard proposals (mock implementation)
      const flashcardProposals = await this.callAIService(sourceText);
      const generatedCount = flashcardProposals.length;
      const endTime = Date.now();
      const generationDuration = endTime - startTime;

      // Step 3: Save the generation metadata to the database
      const { data: generationData, error: generationError } = await supabaseClient
        .from("generations")
        .insert({
          model: "gpt-4", // Mock model name
          generated_count: generatedCount,
          source_text_hash: sourceTextHash,
          source_text_length: sourceTextLength,
          generation_duration: generationDuration,
          user_id: DEFAULT_USER_ID, // Use default user ID
        })
        .select("id")
        .single();

      if (generationError) {
        console.error("Error inserting generation:", generationError);
        await this.logGenerationError(
          supabaseClient,
          "DB_INSERT_ERROR",
          generationError.message,
          "gpt-4",
          sourceTextHash,
          sourceTextLength
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
   * Mock implementation of the AI service call
   * In a real implementation, this would call an external AI service
   */
  private async callAIService(sourceText: string): Promise<FlashcardProposalDto[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Random failure simulation (10% chance)
    if (Math.random() < 0.1) {
      await this.logGenerationError(
        null, // No supabase client needed for this mock error
        "AI_SERVICE_ERROR",
        "AI service failed to generate flashcards",
        "gpt-4",
        this.calculateSourceTextHash(sourceText),
        sourceText.length
      );
      throw new AIServiceError("AI service failed to generate flashcards");
    }

    // Generate 3-7 mock flashcards
    const count = Math.floor(Math.random() * 5) + 3;
    const proposals: FlashcardProposalDto[] = [];

    for (let i = 0; i < count; i++) {
      proposals.push({
        front: `What is concept #${i + 1} from the text?`,
        back: `This is the explanation for concept #${i + 1}.`,
        source: "ai-full",
      });
    }

    return proposals;
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
    sourceTextLength: number
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
        user_id: DEFAULT_USER_ID, // Use default user ID
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
