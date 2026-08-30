"use client";

import { ChevronDown } from "lucide-react";
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
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        disabled={disabled}
        aria-invalid={invalid}
        value={value}
        defaultValue={defaultValue}
        onChange={(event) => onValueChange?.(event.target.value)}
        className={cn(
          "w-full appearance-none rounded-xl border border-border bg-card pr-9 pl-3.5 text-foreground outline-none transition focus-visible:border-gray-400 dark:focus-visible:border-gray-600 focus-visible:ring-1 focus-visible:ring-gray-400/20 shadow-xs disabled:opacity-60",
          size === "sm" ? "h-9 text-xs sm:text-sm" : "h-10 text-sm",
          invalid && "border-destructive",
          className,
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
