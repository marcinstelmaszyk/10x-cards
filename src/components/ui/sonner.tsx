import React from "react";
import { Toaster as Sonner } from "sonner";

// Derive the props type from the imported component
type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Removed useTheme and related logic from next-themes

  return (
    <Sonner
      // Removed theme prop and style prop
      className="toaster group"
      {...props}
    />
  );
};

export { Toaster };
