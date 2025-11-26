"use client";

import { Folder } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyCategoriesProps = {
  onCreateClick: () => void;
};

export const EmptyCategories = ({ onCreateClick }: EmptyCategoriesProps) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <Folder className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No categories yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get started by creating your first category for your menu.
      </p>
      <Button onClick={onCreateClick} className="mt-6 cursor-pointer">
        Create First Category
      </Button>
    </div>
  );
};
