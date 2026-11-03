import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { Check } from "@phosphor-icons/react";
import * as React from "react";

import { cn } from "@/lib/utils";

export type CheckboxProps = {
  id: string;
  label: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
};

export function Checkbox({
  id,
  label,
  checked,
  onChange,
  className = "",
  disabled = false,
}: CheckboxProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BaseCheckbox.Root
        checked={checked}
        className={cn(
          "flex h-4 w-4 cursor-pointer appearance-none items-center justify-center rounded-sm border border-text bg-foreground outline-none disabled:cursor-not-allowed",
          "focus-visible:ring-1 focus-visible:ring-text/80",
          "data-[checked]:bg-primary data-[checked]:border-primary"
        )}
        disabled={disabled}
        id={id}
        onCheckedChange={onChange}
      >
        <BaseCheckbox.Indicator className="flex items-center justify-center text-primary-ink">
          <Check className="h-3 w-3" weight="bold" />
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      <label className="cursor-pointer font-medium text-sm" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
