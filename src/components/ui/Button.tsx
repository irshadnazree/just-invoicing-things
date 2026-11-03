import { Button as BaseButton } from "@base-ui/react/button";
import { cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

export type ButtonProps = {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "default";
  icon?: React.ReactNode;
  disabled?: boolean;
  "aria-label"?: string;
};

const buttonVariants = cva(
  "flex cursor-pointer items-center rounded-md transition-all duration-300 ease-out-cubic hover:duration-100 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-ink hover:ring-1 hover:ring-primary/50 dark:bg-foreground dark:text-primary-text",
        ghost: "bg-transparent text-primary-text hover:bg-foreground/50",
        danger: "bg-error text-white hover:bg-error/90",
      },
      size: {
        sm: "gap-2 px-3 py-1 font-semibold text-sm max-md:py-2.5 pointer-coarse:py-2.5",
        default: "gap-3 px-4 py-2 text-base text-sm xl:px-7 xl:py-3",
      },
      iconSize: {
        sm: "size-fit p-1.5 max-md:p-3 pointer-coarse:p-3",
        default: "size-fit px-2 xl:p-3",
        none: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      iconSize: "none",
    },
  }
);

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "default",
  icon,
  disabled = false,
  "aria-label": ariaLabelProp,
}: ButtonProps) {
  let iconSize: "none" | "sm" | "default" = "default";
  if (children) {
    iconSize = "none";
  } else if (size === "sm") {
    iconSize = "sm";
  } else {
    iconSize = "default";
  }

  return (
    <BaseButton
      aria-label={ariaLabelProp}
      className={cn(
        buttonVariants({ size, iconSize, variant }),
        disabled && "cursor-not-allowed opacity-50"
      )}
      disabled={disabled}
      focusableWhenDisabled
      onClick={onClick}
      type="button"
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </BaseButton>
  );
}
