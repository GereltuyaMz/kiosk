import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export const EbarimtInfoAlert = () => {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        eBarimt credential авахын тулд{" "}
        <a
          href="https://e-invoice.ebarimt.mn"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium underline"
        >
          e-invoice.ebarimt.mn
        </a>{" "}
        сайтад бүртгүүлнэ үү. Тусламж: 1800-1288
      </AlertDescription>
    </Alert>
  );
};
