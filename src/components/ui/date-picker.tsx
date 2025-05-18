
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

export interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined | Date[] | { from: Date; to: Date | undefined }) => void;
  className?: string;
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | { from: Date; to: Date | undefined } | undefined;
}

export function DatePicker({
  date,
  onSelect,
  className,
  mode = "single",
  selected,
}: DatePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      {mode === "single" && (
        <CalendarComponent
          mode="single"
          selected={selected as Date || date}
          onSelect={onSelect as (date: Date | undefined) => void}
          className="rounded-md border p-3 pointer-events-auto"
        />
      )}
      {mode === "range" && (
        <CalendarComponent
          mode="range"
          selected={selected as { from: Date; to: Date | undefined }}
          onSelect={onSelect as (date: { from: Date; to: Date | undefined }) => void}
          className="rounded-md border p-3 pointer-events-auto"
        />
      )}
      {mode === "multiple" && (
        <CalendarComponent
          mode="multiple"
          selected={selected as Date[]}
          onSelect={onSelect as (date: Date[] | undefined) => void}
          className="rounded-md border p-3 pointer-events-auto"
        />
      )}
    </div>
  );
}
