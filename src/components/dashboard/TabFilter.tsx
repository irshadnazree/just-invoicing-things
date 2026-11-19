import { SegmentedControl } from "@irshadnazree/just-things-ui";

type Tab<T extends string> = {
  id: T;
  label: string;
};

type TabFilterProps<T extends string> = {
  activeTab: T;
  onTabChange: (tabId: T) => void;
  tabs: readonly Tab<T>[];
};

export function TabFilter<T extends string>({
  activeTab,
  onTabChange,
  tabs,
}: TabFilterProps<T>) {
  return (
    <SegmentedControl
      aria-label="Filter documents"
      onValueChange={onTabChange}
      options={tabs.map((tab) => ({ value: tab.id, label: tab.label }))}
      size="sm"
      value={activeTab}
    />
  );
}
