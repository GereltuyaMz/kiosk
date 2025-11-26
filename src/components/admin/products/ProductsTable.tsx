"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { DeleteItemDialog } from "@/components/common/DeleteItemDialog";
import { ProductDialog } from "./ProductDialog";
import { ProductsTableView } from "./ProductsTableView";
import { toggleProductStatus, deleteProduct } from "@/lib/admin/products/actions";
import type { Product } from "@/lib/admin/products/types";
import type { Category } from "@/lib/admin/categories/types";

type ProductsTableProps = {
  products: Product[];
  categories: Category[];
};

export const ProductsTable = ({ products, categories }: ProductsTableProps) => {
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
  const [togglingId, setTogglingId] = useState<string | null>(null);

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
    } catch (error) {
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
        products={products}
        categories={categories}
        togglingId={togglingId}
        onToggleStatus={handleToggleStatus}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onCreateClick={handleCreateClick}
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
