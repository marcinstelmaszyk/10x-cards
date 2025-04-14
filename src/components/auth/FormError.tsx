import { Alert } from "@/components/ui/alert";

interface FormErrorProps {
  error?: string;
}

export function FormError({ error }: FormErrorProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className="mb-4">
      <p className="text-sm font-medium">{error}</p>
    </Alert>
  );
}
