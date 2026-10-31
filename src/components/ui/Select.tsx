import * as React from "react";

import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  invalid?: boolean;
  error?: string;
};

const baseSelectClasses =
  "max-h-9.5 w-full border border-input bg-foreground px-3 py-2 leading-tight focus:outline-none focus:ring-1 focus:ring-text/80 disabled:cursor-not-allowed disabled:opacity-50";

export function Select({
  id,
  value,
  onChange,
  options,
  required = false,
  className = "",
  disabled = false,
  placeholder,
  invalid = false,
  error,
}: SelectProps) {
  return (
    <select
      aria-describedby={error ? `${id}-error` : undefined}
      aria-invalid={invalid}
      className={cn(baseSelectClasses, className)}
      disabled={disabled}
      id={id}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      value={value}
    >
      {placeholder && (
        <option disabled value="">
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
