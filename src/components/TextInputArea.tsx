import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TextInputAreaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  minLength: number;
  maxLength: number;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({ value, onChange, placeholder, minLength, maxLength }) => {
  const currentLength = value.length;
  const isValid = currentLength >= minLength && currentLength <= maxLength;
  const isPristine = currentLength === 0;

  return (
    <div className="grid w-full gap-1.5 mb-4">
      <Label htmlFor="text-input-area">Source Text</Label>
      <Textarea
        id="text-input-area"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={10} // Default height, can be adjusted
        className={!isPristine && !isValid ? "border-red-500 focus-visible:ring-red-500" : ""}
      />
      <p className={`text-sm ${!isPristine && !isValid ? "text-red-500" : "text-muted-foreground"}`}>
        {currentLength} / {maxLength} characters (min {minLength})
      </p>
    </div>
  );
};
