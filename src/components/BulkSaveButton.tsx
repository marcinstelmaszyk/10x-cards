import React from "react";
import { Button } from "@/components/ui/button";

interface BulkSaveButtonProps {
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  disabled: boolean; // General disabled state (e.g., no proposals)
  isSaving: boolean; // Specific state for when save is in progress
  hasAcceptedProposals: boolean;
}

export const BulkSaveButton: React.FC<BulkSaveButtonProps> = ({
  onSaveAll,
  onSaveAccepted,
  disabled,
  isSaving,
  hasAcceptedProposals,
}) => {
  const disableSaveAll = disabled || isSaving;
  const disableSaveAccepted = disabled || isSaving || !hasAcceptedProposals;

  return (
    <div className="flex justify-end space-x-2 mt-4 border-t pt-4">
      <Button
        onClick={onSaveAll}
        disabled={disableSaveAll}
        variant="secondary"
        data-test-id="save-all-flashcards-button"
      >
        {isSaving ? "Saving..." : "Save All"}
      </Button>
      <Button
        onClick={onSaveAccepted}
        disabled={disableSaveAccepted}
        variant="default" // Changed to default for primary action
        data-test-id="save-accepted-flashcards-button"
      >
        {isSaving ? "Saving..." : "Save Accepted"}
      </Button>
    </div>
  );
};
