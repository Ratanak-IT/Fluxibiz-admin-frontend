"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

export function SelectField({
  id,
  name,
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  invalid,
  disabled,
  className,
  size = "default",
}: {
  id?: string;
  name?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default";
}) {
  // Radix only learns a value's label once its `SelectItem` has actually been
  // rendered (i.e. the dropdown has been opened at least once), so on first
  // paint `<SelectValue>` has nothing to show. Look the label up ourselves
  // from `options` so the trigger is correct immediately, every time.
  const selectedLabel = value !== undefined ? options.find((option) => option.value === value)?.label : undefined;

  return (
    <Select name={name} value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        aria-invalid={invalid}
        className={cn(
          size === "sm" ? "h-9 text-xs sm:text-sm" : "h-10 text-sm",
          invalid && "border-destructive",
          className,
        )}
      >
        <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
