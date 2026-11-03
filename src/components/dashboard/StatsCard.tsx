import { cva } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type StatsCardProps = {
  count: number;
  icon: ReactNode;
  isLoading?: boolean;
  label: string;
  onClick?: () => void;
};

const cardVariants = cva(
  "group flex cursor-pointer items-center justify-start gap-2 border border-text/30 bg-foreground/50 p-6 transition-all duration-200 hover:border-primary hover:bg-foreground hover:shadow-sm",
  {
    variants: {
      isLoading: {
        true: "animate-pulse cursor-default hover:border-text/30 hover:bg-foreground/50 hover:shadow-none",
        false: "",
      },
    },
    defaultVariants: {
      isLoading: false,
    },
  }
);

export function StatsCard({
  count,
  icon,
  isLoading = false,
  label,
  onClick,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <div className={cn(cardVariants({ isLoading: true }))}>
        <div className="size-10 bg-text/10" />
        <div className="h-8 w-16 bg-text/10" />
        <div className="h-4 w-24 bg-text/10" />
      </div>
    );
  }

  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <button
      aria-label={`${label}: ${count} items. Click to view all ${label.toLowerCase()}.`}
      className={cn(cardVariants({ isLoading: false }))}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      type="button"
    >
      <span className="text-primary-text transition-transform duration-200 group-hover:scale-110">
        {icon}
      </span>
      <span className="text-xl font-bold text-text">{count}</span>
      <span className="text-xl font-medium text-muted">{label}</span>
    </button>
  );
}
