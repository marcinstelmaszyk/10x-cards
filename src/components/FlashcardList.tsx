import React from "react";
import { FlashcardListItem } from "./FlashcardListItem";
import type { FlashcardProposalViewModel } from "./FlashcardListItem";

interface FlashcardListProps {
  flashcards: FlashcardProposalViewModel[];
  onAccept: (id: string) => void;
  onSaveEdit: (id: string, newFront: string, newBack: string) => void;
  onReject: (id: string) => void;
}

export const FlashcardList: React.FC<FlashcardListProps> = ({ flashcards, onAccept, onSaveEdit, onReject }) => {
  if (!flashcards || flashcards.length === 0) {
    return <p>No flashcard proposals generated.</p>;
  }

  return (
    <div className="mt-4">
      {flashcards.map((flashcard) => (
        <FlashcardListItem
          key={flashcard.id} // Use the temporary ID
          flashcard={flashcard}
          onAccept={onAccept}
          onSaveEdit={onSaveEdit}
          onReject={onReject}
        />
      ))}
    </div>
  );
};
