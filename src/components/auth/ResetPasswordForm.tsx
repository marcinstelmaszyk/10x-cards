import { Button } from "@/components/ui/button";
import { useState } from "react";
import { FormInput } from "./FormInput";
import { FormError } from "./FormError";

export function ResetPasswordForm() {
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email format is invalid";
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
      console.log("Reset password form submitted", { email });

      // Show success message
      setSubmitted(true);
    } catch {
      setFormError("An error occurred while processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Check your email</h3>
        <p className="text-gray-600 mb-4">
          We sent a password reset link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <button type="button" onClick={() => setSubmitted(false)} className="text-blue-600 hover:underline">
            try again
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormError error={formError} />

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <FormInput
        id="email"
        label="Email"
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        disabled={isLoading}
        autoComplete="email"
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending link..." : "Send reset link"}
      </Button>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Remember your password?{" "}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Back to login
          </a>
        </p>
      </div>
    </form>
  );
}
