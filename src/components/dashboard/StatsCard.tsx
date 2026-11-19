import { Skeleton, Surface } from "@irshadnazree/just-things-ui";
import type { ReactNode } from "react";

export type StatsCardProps = {
  count: number;
  icon: ReactNode;
  isLoading?: boolean;
  label: string;
  onClick?: () => void;
};

export function StatsCard({
  count,
  icon,
  isLoading = false,
  label,
  onClick,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Surface className="flex items-center gap-3" padding="lg">
        <Skeleton className="size-6" />
        <Skeleton className="h-6 w-28" />
      </Surface>
    );
  }

  return (
    <Surface
      className="flex items-center gap-3"
      interactive
      onClick={onClick}
      padding="lg"
      render={<button type="button" />}
    >
      <span aria-hidden="true" className="text-accent-text">
        {icon}
      </span>
      <span className="jt-num font-semibold text-xl">{count}</span>
      <span className="jt-muted text-xl">{label}</span>
    </Surface>
  );
}
