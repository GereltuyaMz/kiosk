"use client";

import { Pencil, Trash2, Eye, EyeOff } from "lucide-react";
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
import type { Product } from "@/lib/admin/products/types";
import type { Category } from "@/lib/admin/categories/types";

type ProductsTableViewProps = {
  products: Product[];
  categories: Category[];
  togglingId: string | null;
  onToggleStatus: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onCreateClick: () => void;
};

export const ProductsTableView = ({
  products,
  categories,
  togglingId,
  onToggleStatus,
  onEdit,
  onDelete,
  onCreateClick,
}: ProductsTableViewProps) => {
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "Uncategorized";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Products</h2>
          <p className="text-sm text-muted-foreground">
            Manage your menu products
          </p>
        </div>
        <Button onClick={onCreateClick} className="cursor-pointer">
          Add Product
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-32">Display Order</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-40 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                className={!product.is_active ? "text-muted-foreground" : ""}
              >
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {getCategoryName(product.category_id || "")}
                </TableCell>
                <TableCell>{Number(product.base_price)}</TableCell>
                <TableCell>
                  {product.display_order ? product.display_order : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={product.is_active ? "default" : "secondary"}
                    className={
                      product.is_active
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : ""
                    }
                  >
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleStatus(product)}
                      disabled={togglingId === product.id}
                      title={product.is_active ? "Deactivate" : "Activate"}
                      className="cursor-pointer"
                    >
                      {product.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(product)}
                      title="Edit"
                      className="cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(product)}
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
  );
};
