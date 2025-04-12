import React from "react";
import { Button } from "@/components/ui/button";

// Infer props from the Button component itself
interface GenerateButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  isLoading,
  disabled, // Keep disabled here as we are augmenting its logic
  children,
  ...props
}) => {
  return (
    <Button {...props} disabled={disabled || isLoading}>
      {isLoading ? "Generating..." : children}
    </Button>
  );
};
