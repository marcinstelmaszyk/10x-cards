import React, { useState, useEffect } from "react";
import { TextInputArea } from "./TextInputArea";
import { GenerateButton } from "./GenerateButton";
import { useGenerateFlashcards } from "./hooks/useGenerateFlashcards";
import { SkeletonLoader } from "./SkeletonLoader";
import { FlashcardList } from "./FlashcardList";
import type { FlashcardProposalViewModel } from "./FlashcardListItem";
import { v4 as uuidv4 } from "uuid";
import { ErrorNotification } from "./ErrorNotification";
import { BulkSaveButton } from "./BulkSaveButton";
import { toast, Toaster } from "sonner";
import type { FlashcardsCreateCommand, FlashcardCreateDto, Source } from "@/types";

// Validation constants
const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

export const FlashcardGenerationView: React.FC = () => {
  const [textValue, setTextValue] = useState("");
  const {
    isLoading: isGenerating,
    error: generationError,
    data: generationData,
    generateFlashcards,
  } = useGenerateFlashcards();
  const [proposals, setProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  const minLength = 1000;
  const maxLength = 10000;

  useEffect(() => {
    if (generationData?.flashcards_proposals) {
      const initialProposals = generationData.flashcards_proposals.map((proposal) => ({
        ...proposal,
        id: uuidv4(),
        accepted: false,
        edited: false,
        rejected: false,
      }));
      setProposals(initialProposals);
      setSaveError(null);
    } else {
      setProposals([]);
    }
  }, [generationData]);

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextValue(event.target.value);
  };

  const handleGenerateClick = () => {
    if (isValid) {
      setProposals([]);
      setSaveError(null);
      setSavedSuccessfully(false);
      generateFlashcards({ source_text: textValue });
    }
  };

  const handleAccept = (id: string) => {
    setProposals((prev) => {
      const updatedProposals = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            accepted: true,
            rejected: false,
          };
        }
        return p;
      });

      return updatedProposals;
    });
    toast.success("Proposal accepted.");
  };

  const handleSaveEdit = (id: string, newFront: string, newBack: string) => {
    setProposals((prev) => {
      const updatedProposals = prev.map((p) =>
        p.id === id ? { ...p, front: newFront, back: newBack, edited: true, accepted: false } : p
      );

      return updatedProposals;
    });
    toast.success("Edit saved successfully.");
  };

  const handleReject = (id: string) => {
    setProposals((prev) => {
      const updatedProposals = prev.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            rejected: true,
            accepted: false,
          };
        }
        return p;
      });

      return updatedProposals;
    });
    toast.success("Proposal rejected.");
  };

  const handleSave = async (flashcardsToSave: FlashcardProposalViewModel[]) => {
    if (flashcardsToSave.length === 0) {
      toast.error("No flashcards selected to save.");
      return;
    }

    if (!generationData?.generation_id) {
      toast.error("Generation ID is missing. Cannot save flashcards.");
      return;
    }

    // --- Validation ---
    const validationErrors: string[] = [];
    const dtosToSave: FlashcardCreateDto[] = flashcardsToSave.map((vm, index) => {
      const frontValid = vm.front.length > 0 && vm.front.length <= MAX_FRONT_LENGTH;
      const backValid = vm.back.length > 0 && vm.back.length <= MAX_BACK_LENGTH;
      if (!frontValid) {
        validationErrors.push(`Proposal #${index + 1}: Front must be 1-${MAX_FRONT_LENGTH} chars.`);
      }
      if (!backValid) {
        validationErrors.push(`Proposal #${index + 1}: Back must be 1-${MAX_BACK_LENGTH} chars.`);
      }

      let source: Source = "ai-full";
      if (vm.edited) {
        source = "ai-edited";
      }

      return {
        front: vm.front,
        back: vm.back,
        source: source,
        generation_id: generationData.generation_id,
      };
    });

    if (validationErrors.length > 0) {
      const errorDesc = validationErrors.join(" ");
      toast.error("Validation failed:", { description: errorDesc });
      setSaveError("Validation failed. Check lengths.");
      return;
    }
    // --- End Validation ---

    setIsSaving(true);
    setSaveError(null);

    const command: FlashcardsCreateCommand = {
      flashcards: dtosToSave,
    };

    try {
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        let errorMessage = `Failed to save flashcards. Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.warn("Could not parse error response body:", parseError);
        }
        throw new Error(errorMessage);
      }

      await response.json();
      toast.success(`${dtosToSave.length} flashcards saved successfully!`);

      setProposals([]);
      setTextValue("");
      setSavedSuccessfully(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during save";
      setSaveError(errorMessage);
      setSavedSuccessfully(false);
      toast.error("Save failed", { description: errorMessage });
      console.error("Save failed:", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = () => {
    handleSave(proposals);
  };

  const handleSaveAccepted = () => {
    const acceptedProposals = proposals.filter((p) => p.accepted);
    handleSave(acceptedProposals);
  };

  const isValid = textValue.length >= minLength && textValue.length <= maxLength;
  const hasAcceptedProposals = proposals.some((p) => p.accepted);
  const disableBulkSave = proposals.length === 0 || isGenerating || isSaving;

  return (
    <div className="container mx-auto p-4" data-test-id="flashcard-generation-view">
      <Toaster position="top-right" richColors />
      <h1 className="text-2xl font-bold mb-4">Generate Flashcards</h1>
      <TextInputArea
        value={textValue}
        onChange={handleTextChange}
        placeholder={`Paste your text here (${minLength}-${maxLength} characters)`}
        minLength={minLength}
        maxLength={maxLength}
      />
      <GenerateButton
        onClick={handleGenerateClick}
        disabled={!isValid || isGenerating}
        isLoading={isGenerating}
        className="mb-4"
      >
        Generate Flashcards
      </GenerateButton>

      <ErrorNotification message={generationError || saveError || ""} />

      {isGenerating && <SkeletonLoader />}

      {!isGenerating && proposals.length > 0 && (
        <div className="mt-4" data-test-id="flashcard-proposals-container">
          <h2 className="text-xl font-semibold mb-2">Generated Proposals ({proposals.length})</h2>
          <FlashcardList
            flashcards={proposals}
            onAccept={handleAccept}
            onSaveEdit={handleSaveEdit}
            onReject={handleReject}
          />
          <BulkSaveButton
            onSaveAll={handleSaveAll}
            onSaveAccepted={handleSaveAccepted}
            disabled={disableBulkSave}
            isSaving={isSaving}
            hasAcceptedProposals={hasAcceptedProposals}
          />
        </div>
      )}
      {!isGenerating &&
        generationData &&
        proposals.length === 0 &&
        !(generationError || saveError) &&
        !savedSuccessfully && <p className="mt-4">No proposals generated or all were rejected.</p>}
    </div>
  );
};
