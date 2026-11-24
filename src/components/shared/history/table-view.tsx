import {
  Button,
  Checkbox,
  Surface,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@irshadnazree/just-things-ui";
import { CopyIcon, PencilSimpleIcon, TrashIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type TableColumn<TItem> = {
  key: string;
  label: string;
  /** Fixed width class; leave it out to share the remaining width */
  width?: string;
  cellClassName?: string;
  /** Tabular figures, right-aligned: money and counts */
  numeric?: boolean;
  renderCell: (item: TItem) => ReactNode;
};

type TableViewProps<TItem extends { id: string }, TStoredItem> = {
  items: Array<TItem>;
  columns: Array<TableColumn<TItem>>;
  setItems: (items: Array<TStoredItem>) => void;
  selectedItems: Set<string>;
  setSelectedItems: (selectedItems: Set<string>) => void;
  setPendingDeleteId: (pendingDeleteId: string | null) => void;
  loadItems: () => Promise<Array<TStoredItem>>;
  duplicateItem: (id: string) => string | null;
  openItem: (id: string) => void;
  /** Below this the table scrolls inside its card instead of squeezing columns */
  minWidthClassName?: string;
  getItemLabel?: (item: TItem) => string;
};

export default function TableView<TItem extends { id: string }, TStoredItem>({
  items,
  columns,
  setItems,
  selectedItems,
  setSelectedItems,
  setPendingDeleteId,
  loadItems,
  duplicateItem,
  openItem,
  minWidthClassName = "min-w-200",
  getItemLabel,
}: TableViewProps<TItem, TStoredItem>) {
  function toggleSelection(id: string) {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  }

  // WARNING: Select all acts on the rows on screen only, so a filter can't hide a selected row
  const visibleSelectedCount = items.filter((item) =>
    selectedItems.has(item.id)
  ).length;
  const allSelected = items.length > 0 && visibleSelectedCount === items.length;
  const someSelected = visibleSelectedCount > 0 && !allSelected;

  function toggleSelectAll() {
    const newSelection = new Set(selectedItems);
    for (const item of items) {
      if (allSelected) {
        newSelection.delete(item.id);
      } else {
        newSelection.add(item.id);
      }
    }
    setSelectedItems(newSelection);
  }

  async function handleDuplicateItem(id: string) {
    const newId = duplicateItem(id);
    if (newId) {
      setItems(await loadItems());
      openItem(newId);
    }
  }

  function handleDeleteItem(id: string) {
    setPendingDeleteId(id);
  }

  const rowActionsDisabled = selectedItems.size > 0;

  return (
    <Surface className="overflow-x-auto" padding="none">
      <Table className={cn("table-fixed", minWidthClassName)}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                aria-label="Select all"
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>

            {columns.map((column) => (
              <TableHead
                align={column.numeric ? "right" : "left"}
                // oxlint-disable-next-line shadcn/require-static-classes -- widths are static strings in each route's column config
                className={column.width}
                key={column.key}
              >
                {column.label}
              </TableHead>
            ))}

            <TableHead className="relative w-40">
              <span className="jt-visually-hidden">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const itemLabel = getItemLabel?.(item) ?? item.id;
            const isSelected = selectedItems.has(item.id);

            return (
              <TableRow interactive key={item.id} selected={isSelected}>
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${itemLabel}`}
                    checked={isSelected}
                    onCheckedChange={() => toggleSelection(item.id)}
                  />
                </TableCell>

                {columns.map((column) => (
                  <TableCell
                    className={cn(
                      "overflow-hidden",
                      // oxlint-disable-next-line shadcn/require-static-classes -- widths and cell classes are static strings in each route's column config
                      column.width,
                      column.cellClassName
                    )}
                    key={column.key}
                    numeric={column.numeric}
                  >
                    {column.renderCell(item)}
                  </TableCell>
                ))}

                <TableCell align="right">
                  <div className="flex justify-end gap-1">
                    <Button
                      aria-label={`Edit ${itemLabel}`}
                      disabled={rowActionsDisabled}
                      iconOnly
                      onClick={() => openItem(item.id)}
                      size="sm"
                      title="Edit"
                      variant="ghost"
                    >
                      <PencilSimpleIcon size={14} />
                    </Button>
                    <Button
                      aria-label={`Duplicate ${itemLabel}`}
                      disabled={rowActionsDisabled}
                      iconOnly
                      onClick={() => void handleDuplicateItem(item.id)}
                      size="sm"
                      title="Duplicate"
                      variant="ghost"
                    >
                      <CopyIcon size={14} />
                    </Button>
                    <Button
                      aria-label={`Delete ${itemLabel}`}
                      disabled={rowActionsDisabled}
                      iconOnly
                      onClick={() => handleDeleteItem(item.id)}
                      size="sm"
                      title="Delete"
                      variant="ghost"
                    >
                      <TrashIcon size={14} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Surface>
  );
}
