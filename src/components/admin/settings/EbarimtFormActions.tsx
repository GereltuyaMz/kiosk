import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

type TestResult = {
  success: boolean;
  message: string;
} | null;

type EbarimtFormActionsProps = {
  testResult: TestResult;
  isTesting: boolean;
  isSaving: boolean;
  hasMerchantTin: boolean;
  onTestConnection: () => void;
};

export const EbarimtFormActions = ({
  testResult,
  isTesting,
  isSaving,
  hasMerchantTin,
  onTestConnection,
}: EbarimtFormActionsProps) => {
  return (
    <>
      {/* Test Result */}
      {testResult && (
        <Alert
          variant={testResult.success ? "default" : "destructive"}
          className={testResult.success ? "border-green-200 bg-green-50" : ""}
        >
          {testResult.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription className={testResult.success ? "text-green-800" : ""}>
            {testResult.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 pt-4 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          onClick={onTestConnection}
          disabled={isTesting || !hasMerchantTin}
          className="cursor-pointer"
        >
          {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Холболт шалгах
        </Button>
        <Button
          type="submit"
          disabled={isSaving}
          className="cursor-pointer"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Хадгалах
        </Button>
      </div>
    </>
  );
};
