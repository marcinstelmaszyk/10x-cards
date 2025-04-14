import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FormInput } from "./FormInput";
import { FormError } from "./FormError";

export function DeleteAccountForm() {
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "Password is required to confirm account deletion";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // In a real implementation, this would make an API call
    // Currently just simulating form submission
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // The actual API call will be implemented later
      console.log("Delete account form submitted", { password });
    } catch {
      setFormError("An error occurred while trying to delete your account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError error={formError} />

      <div className="mb-4">
        <h3 className="text-lg font-medium text-red-600 mb-2">Delete Account</h3>
        <p className="text-sm text-gray-600">
          This action is permanent and cannot be undone. All your data, including flashcards, will be permanently
          deleted.
        </p>
      </div>

      <FormInput
        id="password"
        label="Enter your password to confirm"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        disabled={isLoading}
        autoComplete="current-password"
      />

      <Button type="submit" variant="destructive" className="w-full" disabled={isLoading}>
        {isLoading ? "Deleting account..." : "Delete my account"}
      </Button>
    </form>
  );
}
