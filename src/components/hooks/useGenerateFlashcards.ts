import { useState } from "react";
import type { GenerateFlashcardsCommand, GenerationCreateResponseDto } from "@/types";

interface UseGenerateFlashcardsResult {
  isLoading: boolean;
  error: string | null;
  data: GenerationCreateResponseDto | null;
  generateFlashcards: (command: GenerateFlashcardsCommand) => Promise<void>;
}

export const useGenerateFlashcards = (): UseGenerateFlashcardsResult => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GenerationCreateResponseDto | null>(null);

  const generateFlashcards = async (command: GenerateFlashcardsCommand): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setData(null);
    console.log("Initiating flashcard generation with:", command);

    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        let errorMessage = `Failed to generate flashcards. Status: ${response.status}`;
        try {
          // Attempt to parse error details from response body
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          // Ignore if response body is not JSON or empty
          console.warn("Could not parse error response body:", parseError);
        }
        throw new Error(errorMessage);
      }

      const result: GenerationCreateResponseDto = await response.json();
      setData(result);
      console.log("Generation successful:", result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during generation";
      setError(errorMessage);
      console.error("Generation failed:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, data, generateFlashcards };
};
