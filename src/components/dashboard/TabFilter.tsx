import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
};

type TabFilterProps = {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
};

const tabVariants = cva(
  "relative px-4 py-2 font-medium text-sm transition-colors duration-200",
  {
    variants: {
      isActive: {
        true: "text-primary-text",
        false: "text-muted hover:text-text",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  }
);

export function TabFilter({ activeTab, onTabChange, tabs }: TabFilterProps) {
  return (
    <div
      aria-label="Filter documents"
      className="flex items-center gap-1 border border-text/20 bg-foreground/50 p-1"
      role="group"
    >
      {tabs.map((tab) => (
        <button
          aria-pressed={activeTab === tab.id}
          className={cn(
            tabVariants({ isActive: activeTab === tab.id }),
            activeTab === tab.id && "bg-background shadow-sm"
          )}
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
