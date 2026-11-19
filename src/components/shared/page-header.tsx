import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: ReactNode;
  /** Before the title, such as a back button */
  leading?: ReactNode;
  /** After the title, such as the save state */
  status?: ReactNode;
  /** Right-hand actions. The primary one goes last. */
  actions?: ReactNode;
  className?: string;
};

/** The Records layout's page header: title on the left, the primary action on the right. */
export function PageHeader({
  title,
  leading,
  status,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <h1 className="font-semibold text-(length:--jt-text-3xl) leading-tight tracking-tight">
          {title}
        </h1>
        {status}
      </div>
      {actions && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}

type SectionHeadingProps = {
  children: ReactNode;
  /** Shown at the right of the heading, such as "Add item" */
  action?: ReactNode;
  className?: string;
};

/** Mono uppercase section label over a hairline. */
export function SectionHeading({
  children,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex min-h-8 items-center justify-between gap-4 border-line border-b pb-2",
        className
      )}
    >
      <h2 className="jt-label">{children}</h2>
      {action}
    </div>
  );
}
