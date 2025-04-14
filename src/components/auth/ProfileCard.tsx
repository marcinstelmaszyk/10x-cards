import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { DeleteAccountForm } from "./DeleteAccountForm";

interface ProfileCardProps {
  email: string;
}

export function ProfileCard({ email }: ProfileCardProps) {
  const [showDeleteForm, setShowDeleteForm] = useState(false);

  return (
    <div className="w-full max-w-md mx-auto py-10">
      <Card className="shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
          <CardDescription>Manage your account settings</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">Email address</h3>
            <p className="text-base font-medium">{email}</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-2">Account Actions</h3>

            {!showDeleteForm ? (
              <Button variant="destructive" onClick={() => setShowDeleteForm(true)} className="mt-2">
                Delete Account
              </Button>
            ) : (
              <div className="space-y-4">
                <DeleteAccountForm />

                <Button variant="outline" onClick={() => setShowDeleteForm(false)} className="w-full">
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button asChild className="w-full">
            <a href="/">Back to Dashboard</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
