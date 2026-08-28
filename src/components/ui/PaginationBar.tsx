"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/SelectField";
import { cn } from "@/lib/utils";

export function PaginationBar({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onSizeChange,
  isLoading = false,
  sizeOptions = [10, 25, 50, 100],
  itemLabel = "item",
  itemLabelPlural,
  className,
}: {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
  isLoading?: boolean;
  sizeOptions?: number[];
  itemLabel?: string;
  itemLabelPlural?: string;
  className?: string;
}) {
  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 0), safeTotalPages - 1);

  const firstRow = totalElements === 0 ? 0 : currentPage * size + 1;
  const lastRow = Math.min((currentPage + 1) * size, totalElements);

  const plural = itemLabelPlural ?? `${itemLabel}s`;
  const noun = totalElements === 1 ? itemLabel : plural;

  const canGoBack = currentPage > 0 && !isLoading;
  const canGoForward = currentPage + 1 < safeTotalPages && !isLoading;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t border-border bg-card px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm">
          Items per page
        </span>
        <SelectField
          size="sm"
          value={String(size)}
          onValueChange={(value) => {
            onSizeChange(Number(value));
            onPageChange(0);
          }}
          disabled={isLoading}
          className="w-[4.5rem] font-bold"
          options={sizeOptions.map((option) => ({ value: String(option), label: String(option) }))}
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <span className="whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm">
          <span className="font-bold text-foreground">
            {firstRow}
            {lastRow > firstRow ? `–${lastRow}` : ""}
          </span>{" "}
          of <span className="font-bold text-foreground">{totalElements}</span> {noun}
        </span>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-full disabled:opacity-30"
            aria-label="Previous page"
            disabled={!canGoBack}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <span className="whitespace-nowrap text-xs font-bold text-foreground sm:text-sm">
            Page {currentPage + 1} of {safeTotalPages}
          </span>

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="size-8 rounded-full disabled:opacity-30"
            aria-label="Next page"
            disabled={!canGoForward}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
