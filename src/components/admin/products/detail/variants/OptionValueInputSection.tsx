import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField, PriceInput } from "@/components/common";

type OptionValueInputSectionProps = {
  currentValue: string;
  currentPrice: number;
  isSubmitting: boolean;
  optionError: string | null;
  onValueChange: (value: string) => void;
  onPriceChange: (price: number) => void;
  onAdd: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const OptionValueInputSection = ({
  currentValue,
  currentPrice,
  isSubmitting,
  optionError,
  onValueChange,
  onPriceChange,
  onAdd,
  onKeyDown,
}: OptionValueInputSectionProps) => {
  return (
    <div className="space-y-2">
      <FormField
        label="Option Values"
        htmlFor="option-value"
        error={optionError || undefined}
      >
        <div className="flex gap-2">
          <Input
            id="option-value"
            placeholder="e.g., Small, Medium, Large"
            value={currentValue}
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isSubmitting}
            className="flex-1"
          />
          <div className="w-32">
            <PriceInput
              value={currentPrice}
              onChange={onPriceChange}
              placeholder="Price"
              disabled={isSubmitting}
              allowNegative
            />
          </div>
          <Button
            type="button"
            size="icon"
            onClick={onAdd}
            disabled={isSubmitting || !currentValue.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </FormField>
      <p className="text-xs text-muted-foreground">
        Enter name and price, then press Enter or click + to add
      </p>
    </div>
  );
};
