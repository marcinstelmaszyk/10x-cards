import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FormInput } from "./FormInput";
import { FormError } from "./FormError";

export function ResetPasswordConfirmForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password) {
      newErrors.password = "New password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = "Password must contain uppercase, lowercase letters and numbers";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    // In a real implementation, this would make an API call with the token from URL
    // Currently just simulating form submission
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // The actual API call will be implemented later
      console.log("Password reset confirmed", { password });

      setSuccess(true);
    } catch {
      setFormError("An error occurred while resetting your password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Password reset successful</h3>
        <p className="text-gray-600 mb-4">Your password has been changed successfully.</p>
        <Button asChild className="mt-2">
          <a href="/auth/login">Go to login</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError error={formError} />

      <div className="mb-4">
        <p className="text-sm text-gray-600">Enter your new password below.</p>
      </div>

      <FormInput
        id="password"
        label="New Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        disabled={isLoading}
        autoComplete="new-password"
      />

      <FormInput
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        disabled={isLoading}
        autoComplete="new-password"
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Resetting password..." : "Reset password"}
      </Button>
    </form>
  );
}
