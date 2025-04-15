import { Button } from "@/components/ui/button";
import { useState } from "react";

interface UserNavProps {
  user?: { email: string };
}

export function UserNav({ user }: UserNavProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Redirect to login page after successful logout
        window.location.href = "/auth/login";
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    // Not logged in - show login/register buttons
    return (
      <div className="flex gap-2 items-center">
        <Button asChild variant="outline" size="sm">
          <a href="/auth/login">Login</a>
        </Button>
        <Button asChild size="sm">
          <a href="/auth/register">Register</a>
        </Button>
      </div>
    );
  }

  // Logged in - show user menu with profile and logout options
  return (
    <div className="flex gap-2 items-center">
      <Button asChild variant="ghost" size="sm">
        <a href="/auth/profile">
          <span className="font-medium">{user.email}</span>
        </a>
      </Button>

      <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
