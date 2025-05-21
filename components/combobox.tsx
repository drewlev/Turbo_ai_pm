"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ComboboxProps {
  options: Option[];
  value: string | string[];
  onValueChange: (value: string | string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  className?: string;
  trigger?: React.ReactNode;
  multiSelect?: boolean;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  emptyMessage = "No options found.",
  searchPlaceholder = "Search...",
  className,
  trigger,
  multiSelect = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const selectedOptions = multiSelect
    ? options.filter((option) => (value as string[]).includes(option.value))
    : [options.find((option) => option.value === value)].filter(Boolean);

  const displayValue =
    selectedOptions.length > 0
      ? multiSelect
        ? `${selectedOptions.length} selected`
        : selectedOptions[0]?.label ?? placeholder
      : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-[200px] justify-between", className)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center">
              {!multiSelect && selectedOptions[0]?.icon}
              <span>{displayValue}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        align="start"
        sideOffset={4}
        onClick={(e) => e.stopPropagation()}
      >
        <Command onClick={(e) => e.stopPropagation()}>
          <CommandInput
            placeholder={searchPlaceholder}
            onClick={(e) => e.stopPropagation()}
          />
          <CommandList onClick={(e) => e.stopPropagation()}>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup onClick={(e) => e.stopPropagation()}>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    if (multiSelect) {
                      const currentValues = value as string[];
                      const newValues = currentValues.includes(currentValue)
                        ? currentValues.filter((v) => v !== currentValue)
                        : [...currentValues, currentValue];
                      onValueChange(newValues);
                    } else {
                      onValueChange(currentValue === value ? "" : currentValue);
                      setOpen(false);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center">
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        multiSelect
                          ? (value as string[]).includes(option.value)
                            ? "opacity-100"
                            : "opacity-0"
                          : value === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.icon}
                    <span>{option.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
