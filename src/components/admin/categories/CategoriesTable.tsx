"use client";

import { useState, useMemo } from "react";
import { Folder } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, DeleteItemDialog } from "@/components/common";
import { CategoryDialog } from "./CategoryDialog";
import { CategoriesTableView } from "./CategoriesTableView";
import { toggleCategoryStatus, deleteCategory } from "@/lib/admin/categories/actions";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const matchesSearch = searchQuery === "" ||
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.is_active) ||
        (statusFilter === "inactive" && !category.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchQuery, statusFilter]);

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
    } catch {
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
      <CategoriesTableView
        categories={filteredCategories}
        togglingId={togglingId}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onCreateClick={handleCreateClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />

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
