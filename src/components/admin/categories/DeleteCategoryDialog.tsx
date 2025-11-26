"use client";

import { DeleteItemDialog } from "@/components/common/DeleteItemDialog";
import { deleteCategory } from "@/lib/admin/categories/actions";
import type { Category } from "@/lib/admin/categories/types";

type DeleteCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category;
  onSuccess: () => void;
};

export const DeleteCategoryDialog = ({
  open,
  onOpenChange,
  category,
  onSuccess,
}: DeleteCategoryDialogProps) => {
  const handleDelete = async () => {
    const result = await deleteCategory(category.id);

    if (!result.success) {
      throw new Error(result.error);
    }

    onSuccess();
  };

  return (
    <DeleteItemDialog
      open={open}
      onOpenChange={onOpenChange}
      itemName={category.name}
      entityType="Category"
      onDelete={handleDelete}
    />
  );
};
