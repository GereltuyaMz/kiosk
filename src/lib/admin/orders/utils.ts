import type { DateFilter } from "./types";

export type DateRange = {
  from: Date;
  to: Date;
};

export const getDateRange = (filter: DateFilter): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case "today": {
      const endOfDay = new Date(today);
      endOfDay.setDate(endOfDay.getDate() + 1);
      endOfDay.setMilliseconds(-1);
      return { from: today, to: endOfDay };
    }

    case "yesterday": {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const endOfYesterday = new Date(today);
      endOfYesterday.setMilliseconds(-1);
      return { from: yesterday, to: endOfYesterday };
    }

    case "last7days": {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      const endOfDay = new Date(today);
      endOfDay.setDate(endOfDay.getDate() + 1);
      endOfDay.setMilliseconds(-1);
      return { from: sevenDaysAgo, to: endOfDay };
    }

    case "thisMonth": {
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfDay = new Date(today);
      endOfDay.setDate(endOfDay.getDate() + 1);
      endOfDay.setMilliseconds(-1);
      return { from: firstDayOfMonth, to: endOfDay };
    }

    case "custom":
    default:
      return { from: today, to: today };
  }
};

export const formatOrderTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatOrderDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatOrderDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const getDateFilterLabel = (filter: DateFilter): string => {
  switch (filter) {
    case "today":
      return "Today";
    case "yesterday":
      return "Yesterday";
    case "last7days":
      return "Last 7 Days";
    case "thisMonth":
      return "This Month";
    case "custom":
      return "Custom Range";
    default:
      return "Today";
  }
};

export const DATE_FILTER_OPTIONS: { value: DateFilter; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "last7days", label: "Last 7 Days" },
  { value: "thisMonth", label: "This Month" },
  { value: "custom", label: "Custom Range" },
];
