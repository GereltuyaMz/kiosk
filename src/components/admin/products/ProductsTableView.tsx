"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Pencil, Trash2, ImageIcon } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TablePagination } from "@/components/common";
import { ProductFilter } from "./ProductFilter";
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
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: "all" | "active" | "inactive";
  onStatusFilterChange: (value: "all" | "active" | "inactive") => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
};

export const ProductsTableView = ({
  products,
  categories,
  togglingId,
  onToggleStatus,
  onEdit,
  onDelete,
  onCreateClick,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
}: ProductsTableViewProps) => {
  const router = useRouter();

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
        <ProductFilter
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={onCategoryFilterChange}
          categories={categories.filter((c) => c.is_active)}
        />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="w-32">Display Order</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-32 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <p className="text-sm text-muted-foreground">
                    No products found matching your filters.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
              <TableRow
                key={product.id}
                className={!product.is_active ? "text-muted-foreground" : ""}
              >
                <TableCell>
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  <button
                    onClick={() => router.push(`/admin/products/${product.id}`)}
                    className="text-left cursor-pointer text-blue-600 underline hover:text-blue-800 transition-colors"
                  >
                    {product.name}
                  </button>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {getCategoryName(product.category_id || "")}
                </TableCell>
                <TableCell>{Number(product.base_price)}</TableCell>
                <TableCell>
                  {product.display_order ? product.display_order : "—"}
                </TableCell>
                <TableCell>
                  <Select
                    value={product.is_active ? "active" : "inactive"}
                    onValueChange={(value) => {
                      if ((value === "active" && !product.is_active) ||
                          (value === "inactive" && product.is_active)) {
                        onToggleStatus(product);
                      }
                    }}
                    disabled={togglingId === product.id}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Active
                        </span>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                          Inactive
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={10}
        totalItems={totalItems}
        currentItemsCount={products.length}
        itemLabel="products"
      />
    </div>
  );
};
