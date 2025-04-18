import { AlertCircle } from "lucide-react";
import PropTypes from "prop-types";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorNotificationProps {
  message: string;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({ message }) => {
  if (!message) return null;

  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
};

ErrorNotification.propTypes = {
  message: PropTypes.string.isRequired,
};
