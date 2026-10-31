import { FileText, Receipt } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";

import { cn, formatCurrency } from "@/lib/utils";

type DocumentType = "invoice" | "quotation";

type DocumentListItemProps = {
  client: string;
  currency: string;
  date: string;
  documentId: string;
  id: string;
  isLoading?: boolean;
  total: number;
  type: DocumentType;
  updatedAt: string;
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSecs < 60) {
    return "Just now";
  }
  if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  }
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  if (diffWeeks === 1) {
    return "Last week";
  }
  if (diffWeeks < 4) {
    return `${diffWeeks} weeks ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function DocumentListItemSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 border border-text/20 bg-foreground/30 p-4">
      <div className="size-10 bg-text/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-text/10" />
        <div className="h-3 w-32 bg-text/10" />
      </div>
      <div className="h-4 w-20 bg-text/10" />
      <div className="h-4 w-24 bg-text/10" />
    </div>
  );
}

export function DocumentListItem({
  client,
  currency,
  documentId,
  id,
  isLoading,
  total,
  type,
  updatedAt,
}: DocumentListItemProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <DocumentListItemSkeleton />;
  }

  const handleClick = () => {
    if (type === "invoice") {
      navigate({
        to: "/invoice/$invoice",
        params: { invoice: id },
      });
      return;
    }

    navigate({
      to: "/quotation/$quotation",
      params: { quotation: id },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  const Icon = type === "invoice" ? Receipt : FileText;
  const iconColor = "text-primary";
  const bgColor = "bg-primary/10";

  return (
    <button
      aria-label={`${type === "invoice" ? "Invoice" : "Quotation"} ${documentId} for ${client}, ${formatCurrency(total, currency)}, updated ${formatRelativeTime(updatedAt)}. Click to open.`}
      className={cn(
        "flex w-full items-center gap-4 border border-text/20 bg-foreground/50 p-4",
        "transition-all duration-200",
        "hover:border-primary hover:bg-foreground hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      type="button"
    >
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center",
          bgColor
        )}
      >
        <Icon className={cn("size-5", iconColor)} weight="duotone" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
        <span className="tabular-nums font-medium text-sm text-primary">
          {documentId}
        </span>
        <span className="block truncate text-sm text-text" title={client}>
          {client}
        </span>
      </div>

      <div className="hidden shrink-0 tabular-nums font-medium text-sm text-text sm:block">
        {formatCurrency(total, currency)}
      </div>

      <div className="shrink-0 text-xs text-muted">
        {formatRelativeTime(updatedAt)}
      </div>
    </button>
  );
}
