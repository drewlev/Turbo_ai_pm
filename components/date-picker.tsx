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
  date,
  onValueChange,
}: {
  date: string;
  onValueChange: (value: string) => void;
}) {
  const [newDate, setNewDate] = React.useState<Date>(new Date(date));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            " justify-start text-left font-normal",
            !date && "text-muted-foreground",
            "h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Due Date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[var(--background-dark)]">
        <Calendar
          mode="single"
          selected={newDate}
          onSelect={(value) => {
            setNewDate(value as Date);
            onValueChange(format(value as Date, "MM-dd-yyyy"));
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
