"use client";

import { useState, useMemo } from "react";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, DeleteItemDialog } from "@/components/common";
import { ProductDialog } from "./ProductDialog";
import { ProductsTableView } from "./ProductsTableView";
import { toggleProductStatus, deleteProduct } from "@/lib/admin/products/actions";
import type { Product } from "@/lib/admin/products/types";
import type { Category } from "@/lib/admin/categories/types";

type ProductsTableProps = {
  products: Product[];
  categories: Category[];
};

const ITEMS_PER_PAGE = 10;

export const ProductsTable = ({ products, categories }: ProductsTableProps) => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = searchQuery === "" ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.is_active) ||
        (statusFilter === "inactive" && !product.is_active);

      const matchesCategory =
        categoryFilter === "all" ||
        (categoryFilter === "uncategorized" && !product.category_id) ||
        product.category_id === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleCreateClick = () => {
    setSelectedProduct(undefined);
    setProductDialogOpen(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setProductDialogOpen(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleToggleStatus = async (product: Product) => {
    setTogglingId(product.id);

    try {
      const result = await toggleProductStatus(product.id);

      if (result.success) {
        toast.success(
          result.data.is_active
            ? "Product activated successfully"
            : "Product deactivated successfully"
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

  if (products.length === 0) {
    return (
      <>
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Get started by creating your first product for your menu."
          buttonText="Create First Product"
          onButtonClick={handleCreateClick}
        />
        <ProductDialog
          open={productDialogOpen}
          onOpenChange={setProductDialogOpen}
          product={selectedProduct}
          categories={categories}
          onSuccess={handleSuccess}
        />
      </>
    );
  }

  return (
    <>
      <ProductsTableView
        products={paginatedProducts}
        categories={categories}
        togglingId={togglingId}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onCreateClick={handleCreateClick}
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          handleFilterChange();
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          handleFilterChange();
        }}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={(value) => {
          setCategoryFilter(value);
          handleFilterChange();
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={filteredProducts.length}
      />

      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={selectedProduct}
        categories={categories}
        onSuccess={handleSuccess}
      />

      {selectedProduct && (
        <DeleteItemDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          itemName={selectedProduct.name}
          entityType="Product"
          onDelete={async () => {
            const result = await deleteProduct(selectedProduct.id);
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
