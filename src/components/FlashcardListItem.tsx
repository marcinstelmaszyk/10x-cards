import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckIcon, PencilIcon, XIcon, SaveIcon, XCircleIcon } from "lucide-react";
import type { FlashcardProposalDto } from "@/types";

// Validation constants (can be moved to a shared place later)
const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

// Define ViewModel type as per plan
export interface FlashcardProposalViewModel extends FlashcardProposalDto {
  id: string; // Add a temporary unique ID for mapping/keys
  accepted: boolean;
  edited: boolean;
  rejected: boolean;
}

interface FlashcardListItemProps {
  flashcard: FlashcardProposalViewModel;
  onAccept: (id: string) => void;
  onSaveEdit: (id: string, newFront: string, newBack: string) => void; // Renamed from onEdit
  onReject: (id: string) => void;
}

export const FlashcardListItem: React.FC<FlashcardListItemProps> = ({ flashcard, onAccept, onSaveEdit, onReject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(flashcard.front);
  const [editedBack, setEditedBack] = useState(flashcard.back);

  // Reset local state if flashcard prop changes (e.g., after parent save)
  useEffect(() => {
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
    // Keep isEditing state as is, parent doesn't force exit from edit mode directly
  }, [flashcard.front, flashcard.back]);

  const frontLength = editedFront.length;
  const backLength = editedBack.length;
  const isFrontValid = frontLength > 0 && frontLength <= MAX_FRONT_LENGTH;
  const isBackValid = backLength > 0 && backLength <= MAX_BACK_LENGTH;
  const canSaveChanges = isFrontValid && isBackValid;

  const handleAccept = () => onAccept(flashcard.id);

  const handleEditClick = () => {
    setIsEditing(true);
    // Initialize edit state with current values when entering edit mode
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset potentially invalid changes
    setEditedFront(flashcard.front);
    setEditedBack(flashcard.back);
  };

  const handleSaveEditClick = () => {
    if (canSaveChanges) {
      onSaveEdit(flashcard.id, editedFront, editedBack);
      setIsEditing(false); // Exit edit mode after saving
    }
  };

  const handleReject = () => onReject(flashcard.id);

  return (
    <Card
      className={`mb-4 transition-all duration-300 ${flashcard.accepted ? "border-green-500" : ""} ${flashcard.edited ? "border-blue-500" : ""} ${flashcard.rejected ? "border-red-500" : ""} ${isEditing ? "border-yellow-500" : ""}`}
      data-test-id={`flashcard-item-${flashcard.id}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>
          Proposal {flashcard.edited ? "(Edited)" : ""} {flashcard.accepted ? "(Accepted)" : ""}{" "}
          {flashcard.rejected ? "(Rejected)" : ""}
        </CardTitle>
        <div className="flex space-x-1">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancelEdit}
                title="Cancel"
                data-test-id={`flashcard-cancel-edit-button-${flashcard.id}`}
              >
                <XCircleIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSaveEditClick}
                disabled={!canSaveChanges}
                title="Save"
                data-test-id={`flashcard-save-edit-button-${flashcard.id}`}
              >
                <SaveIcon className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAccept}
                disabled={flashcard.accepted}
                className={flashcard.accepted ? "text-green-500" : ""}
                title="Accept"
                data-test-id={`flashcard-accept-button-${flashcard.id}`}
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEditClick}
                disabled={flashcard.accepted}
                title="Edit"
                data-test-id={`flashcard-edit-button-${flashcard.id}`}
              >
                <PencilIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReject}
                className={flashcard.rejected ? "text-red-500" : ""}
                title="Reject"
                data-test-id={`flashcard-reject-button-${flashcard.id}`}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`front-edit-${flashcard.id}`}>
                Front ({frontLength}/{MAX_FRONT_LENGTH})
              </Label>
              <Textarea
                id={`front-edit-${flashcard.id}`}
                data-test-id={`flashcard-front-edit-${flashcard.id}`}
                value={editedFront}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedFront(e.target.value)}
                rows={3}
                className={!isFrontValid ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {!isFrontValid && (
                <p className="text-xs text-red-500 pt-1">Front must be 1-{MAX_FRONT_LENGTH} characters.</p>
              )}
            </div>
            <div>
              <Label htmlFor={`back-edit-${flashcard.id}`}>
                Back ({backLength}/{MAX_BACK_LENGTH})
              </Label>
              <Textarea
                id={`back-edit-${flashcard.id}`}
                data-test-id={`flashcard-back-edit-${flashcard.id}`}
                value={editedBack}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditedBack(e.target.value)}
                rows={5}
                className={!isBackValid ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {!isBackValid && (
                <p className="text-xs text-red-500 pt-1">Back must be 1-{MAX_BACK_LENGTH} characters.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div>
              <p className="font-semibold">Front:</p>
              <p className="whitespace-pre-wrap" data-test-id={`flashcard-front-text-${flashcard.id}`}>
                {flashcard.front}
              </p>
            </div>
            <div>
              <p className="font-semibold">Back:</p>
              <p className="whitespace-pre-wrap" data-test-id={`flashcard-back-text-${flashcard.id}`}>
                {flashcard.back}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
