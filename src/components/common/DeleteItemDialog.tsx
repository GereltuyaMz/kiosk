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

type DeleteItemDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  entityType: string;
  onDelete: () => Promise<void>;
  description?: string;
};

export const DeleteItemDialog = ({
  open,
  onOpenChange,
  itemName,
  entityType,
  onDelete,
  description,
}: DeleteItemDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await onDelete();
      toast.success(`${entityType} deleted successfully`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultDescription = `Are you sure you want to delete ${itemName}? This action cannot be undone and will permanently remove this ${entityType.toLowerCase()} from the database.`;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {entityType}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || (
              <>
                Are you sure you want to delete <strong>{itemName}</strong>?
                This action cannot be undone and will permanently remove this {entityType.toLowerCase()}
                {" "}from the database.
              </>
            )}
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
