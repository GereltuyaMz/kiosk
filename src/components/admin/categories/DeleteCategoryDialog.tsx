"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const result = await deleteCategory(category.id);

      if (result.success) {
        toast.success("Category deleted successfully");
        onOpenChange(false);
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Category</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{category.name}</strong>?
            This action cannot be undone and will permanently remove this category
            from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
