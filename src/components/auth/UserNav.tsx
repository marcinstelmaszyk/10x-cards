import { Button } from "@/components/ui/button";

interface UserNavProps {
  user?: { email: string };
}

export function UserNav({ user }: UserNavProps) {
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

      <Button asChild variant="outline" size="sm">
        <a href="/api/auth/logout">Logout</a>
      </Button>
    </div>
  );
}
