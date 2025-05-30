"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  date: existingDate,
  onValueChange,
}: {
  date: Date;
  onValueChange?: (date: Date) => void;
}) {
  const [date, setDate] = React.useState<Date>(existingDate);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      onValueChange?.(newDate);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          size={"sm"}
          className={cn(
            "text-gray-300  border-[#2a2a2a] hover:bg-[#2a2a2a] hover:bg-[#2a2a2a] hover:text-white border-1  justify-start text-left text-xs font-normal ",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 ">
        <Calendar
          className="flex flex-row"
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          initialFocus
          required
        />
      </PopoverContent>
    </Popover>
  );
}
