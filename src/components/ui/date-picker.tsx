
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

export interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | undefined;
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
      <CalendarComponent
        mode={mode}
        selected={selected || date}
        onSelect={onSelect}
        className="rounded-md border p-3 pointer-events-auto"
      />
    </div>
  );
}
