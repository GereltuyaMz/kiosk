import { Label } from "@/components/ui/label";
import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  hint?: string;
};

export const FormField = ({
  label,
  htmlFor,
  error,
  children,
  hint,
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
