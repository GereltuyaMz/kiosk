"use client";

import { useState } from "react";
import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { DeleteItemDialog } from "@/components/common/DeleteItemDialog";
import { CategoryDialog } from "./CategoryDialog";
import { toggleCategoryStatus, deleteCategory } from "@/lib/admin/categories/actions";
import { Folder } from "lucide-react";
import type { Category } from "@/lib/admin/categories/types";

type CategoriesTableProps = {
  categories: Category[];
};

export const CategoriesTable = ({ categories }: CategoriesTableProps) => {
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleCreateClick = () => {
    setSelectedCategory(undefined);
    setCategoryDialogOpen(true);
  };

  const handleEditClick = (category: Category) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (category: Category) => {
    setTogglingId(category.id);

    try {
      const result = await toggleCategoryStatus(category.id);

      if (result.success) {
        toast.success(
          result.data.is_active
            ? "Category activated successfully"
            : "Category deactivated successfully"
        );
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSuccess = () => {
    window.location.reload();
  };

  if (categories.length === 0) {
    return (
      <>
        <EmptyState
          icon={Folder}
          title="No categories yet"
          description="Get started by creating your first category for your menu."
          buttonText="Create First Category"
          onButtonClick={handleCreateClick}
        />
        <CategoryDialog
          open={categoryDialogOpen}
          onOpenChange={setCategoryDialogOpen}
          category={selectedCategory}
          onSuccess={handleSuccess}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-sm text-muted-foreground">
              Manage your menu categories
            </p>
          </div>
          <Button onClick={handleCreateClick} className="cursor-pointer">
            Add Category
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">
                  Description
                </TableHead>
                <TableHead className="w-32">Display Order</TableHead>
                <TableHead className="w-24">Status</TableHead>
                <TableHead className="w-40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow
                  key={category.id}
                  className={!category.is_active ? "text-muted-foreground" : ""}
                >
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {category.description || "-"}
                  </TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    <Badge
                      variant={category.is_active ? "default" : "secondary"}
                      className={
                        category.is_active
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : ""
                      }
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleStatus(category)}
                        disabled={togglingId === category.id}
                        title={category.is_active ? "Deactivate" : "Activate"}
                        className="cursor-pointer"
                      >
                        {category.is_active ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(category)}
                        title="Edit"
                        className="cursor-pointer"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(category)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <CategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={selectedCategory}
        onSuccess={handleSuccess}
      />

      {selectedCategory && (
        <DeleteItemDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={selectedCategory.name}
          entityType="Category"
          onDelete={async () => {
            const result = await deleteCategory(selectedCategory.id);
            if (!result.success) {
              throw new Error(result.error);
            }
            handleSuccess();
          }}
        />
      )}
    </>
  );
};
