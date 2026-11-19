import { Skeleton, Surface, Tag } from "@irshadnazree/just-things-ui";
import { FileTextIcon, ReceiptIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";

import { formatCurrency } from "@/lib/utils";

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
    <Surface className="flex items-center gap-4">
      <Skeleton className="size-9" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-3 w-16" />
    </Surface>
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

  const Icon = type === "invoice" ? ReceiptIcon : FileTextIcon;
  const typeLabel = type === "invoice" ? "Invoice" : "Quotation";
  const updated = formatRelativeTime(updatedAt);

  return (
    <Surface
      aria-label={`${typeLabel} ${documentId} for ${client}, ${formatCurrency(total, currency)}, updated ${updated}`}
      className="flex items-center gap-4"
      interactive
      onClick={handleClick}
      render={<button type="button" />}
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent-text"
      >
        <Icon size={18} weight="duotone" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="jt-mono whitespace-nowrap font-medium text-sm">
            {documentId}
          </span>
          <Tag>{typeLabel}</Tag>
        </span>
        <span
          className="jt-muted block max-w-full truncate text-sm"
          title={client}
        >
          {client}
        </span>
      </span>

      <span className="jt-mono jt-num hidden shrink-0 text-sm sm:block">
        {formatCurrency(total, currency)}
      </span>

      <span className="jt-muted w-20 shrink-0 text-right text-xs">
        {updated}
      </span>
    </Surface>
  );
}
