import { MultiImageUpload } from "@/components/common";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type ProductImageSectionProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  disabled: boolean;
};

export const ProductImageSection = ({
  value,
  onChange,
  disabled,
}: ProductImageSectionProps) => {
  return (
    <Card className="py-4 px-3 rounded-md gap-3 shadow-none">
      <h2 className="text-lg font-semibold">Product Images</h2>
      <Separator />
      <MultiImageUpload
        value={value}
        onChange={onChange}
        bucket="product-images"
        disabled={disabled}
        maxImages={5}
      />
    </Card>
  );
};
