"use client";

import { format } from "date-fns";
import { Search, CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DATE_FILTER_OPTIONS } from "@/lib/admin/orders/utils";
import type { DateFilter, OrderStatus } from "@/lib/admin/orders/types";

type OrderFilterProps = {
  dateFilter: DateFilter;
  onDateFilterChange: (value: DateFilter) => void;
  customDateRange?: { from: Date; to: Date };
  onCustomDateRangeChange?: (range: { from: Date; to: Date }) => void;
  statusFilter: OrderStatus | "all";
  onStatusFilterChange: (value: OrderStatus | "all") => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

const STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "NEW", label: "New" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export const OrderFilter = ({
  dateFilter,
  onDateFilterChange,
  customDateRange,
  onCustomDateRangeChange,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
}: OrderFilterProps) => {
  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to && onCustomDateRangeChange) {
      onCustomDateRangeChange({ from: range.from, to: range.to });
    }
  };

  const formatDateRange = () => {
    if (!customDateRange?.from || !customDateRange?.to) {
      return "Pick a date range";
    }
    return `${format(customDateRange.from, "MMM d")} - ${format(customDateRange.to, "MMM d, yyyy")}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
      <Select value={dateFilter} onValueChange={onDateFilterChange}>
        <SelectTrigger className="w-full sm:w-40">
          <SelectValue placeholder="Select date" />
        </SelectTrigger>
        <SelectContent>
          {DATE_FILTER_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {dateFilter === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={customDateRange?.from}
              selected={{
                from: customDateRange?.from,
                to: customDateRange?.to,
              }}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              disabled={{ after: new Date() }}
            />
          </PopoverContent>
        </Popover>
      )}

      <Select
        value={statusFilter}
        onValueChange={(value) =>
          onStatusFilterChange(value as OrderStatus | "all")
        }
      >
        <SelectTrigger className="w-full sm:w-36">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by order #..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
};
