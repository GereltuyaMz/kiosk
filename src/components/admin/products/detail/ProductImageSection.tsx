import { MultiImageUpload } from "@/components/common";
import { Card } from "@/components/ui/card";

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
    <Card className="p-7 rounded-xl gap-3">
      <h2 className="text-lg font-semibold mb-5">Product Images</h2>
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
