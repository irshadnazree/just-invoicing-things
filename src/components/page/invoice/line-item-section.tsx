import { CopyIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField, FormLabel } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import {
  useInvoiceAddItem,
  useInvoiceAddItemDetail,
  useInvoiceCurrency,
  useInvoiceDuplicateItem,
  useInvoiceItems,
  useInvoiceRemoveItem,
  useInvoiceRemoveItemDetail,
  useInvoiceUpdateItem,
  useInvoiceUpdateItemDetail,
} from "@/stores/invoice-store";
import type { InvoiceLineItem } from "@/types/invoice";

export default function LineItemSection() {
  const currency = useInvoiceCurrency();
  const items = useInvoiceItems();
  const addItem = useInvoiceAddItem();
  const duplicateItem = useInvoiceDuplicateItem();
  const removeItem = useInvoiceRemoveItem();
  const updateItem = useInvoiceUpdateItem();
  const addItemDetail = useInvoiceAddItemDetail();
  const removeItemDetail = useInvoiceRemoveItemDetail();
  const updateItemDetail = useInvoiceUpdateItemDetail();

  function handleAddItem() {
    addItem();
  }

  function handleUpdateItem(index: number, field: string, value: unknown) {
    updateItem(index, field as keyof InvoiceLineItem, value as never);
  }

  function handleDuplicateItem(index: number) {
    duplicateItem(index);
  }

  function handleRemoveItem(index: number) {
    removeItem(index);
  }

  function handleAddItemDetail(itemIndex: number) {
    addItemDetail(itemIndex);
  }

  function handleUpdateItemDetail(
    itemIndex: number,
    detailIndex: number,
    value: unknown
  ) {
    updateItemDetail(itemIndex, detailIndex, value as string);
  }

  function handleRemoveItemDetail(itemIndex: number, detailIndex: number) {
    removeItemDetail(itemIndex, detailIndex);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b-2 pb-1">
        <h3 className="border-text font-semibold text-lg">Line Items</h3>
        {items.length > 0 && (
          <Button
            icon={<PlusIcon size={18} weight="bold" />}
            onClick={handleAddItem}
            size="sm"
            variant="ghost"
          >
            Add Item
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-6">
        {items.length === 0 && (
          <Card
            className="flex flex-col items-center justify-center gap-2"
            variant="placeholder"
          >
            <Button
              icon={<PlusIcon size={18} />}
              onClick={handleAddItem}
              size="sm"
              variant="ghost"
            >
              Add New Line Item
            </Button>
          </Card>
        )}
        {items.map((item, itemIndex) => (
          <Card key={`item-${itemIndex + 1}`}>
            <div className="mb-2 flex items-start justify-between">
              <p>Item {itemIndex + 1}</p>
              <div className="flex items-center">
                <Button
                  aria-label={`Duplicate item ${itemIndex + 1}`}
                  icon={<CopyIcon size={18} />}
                  onClick={() => handleDuplicateItem(itemIndex)}
                  size="sm"
                  variant="ghost"
                />

                <Button
                  aria-label={`Remove item ${itemIndex + 1}`}
                  icon={<TrashIcon size={18} />}
                  onClick={() => handleRemoveItem(itemIndex)}
                  size="sm"
                  variant="ghost"
                />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-5">
              <FormField className="col-span-2 xl:col-span-3">
                <FormLabel id="item-name" label="Item Name" />
                <Input
                  id={`item-name-${itemIndex}`}
                  onChange={(value) =>
                    handleUpdateItem(itemIndex, "name", value as string)
                  }
                  value={item.name}
                />
              </FormField>
              <FormField className="col-span-1">
                <FormLabel id="item-code" label="Code" />
                <Input
                  id={`item-code-${itemIndex}`}
                  onChange={(value) =>
                    handleUpdateItem(itemIndex, "code", value as string)
                  }
                  value={item.code}
                />
              </FormField>
              <FormField>
                <FormLabel id="item-quantity" label="Quantity" />
                <Input
                  id={`item-quantity-${itemIndex}`}
                  onChange={(value) =>
                    handleUpdateItem(itemIndex, "quantity", value as number)
                  }
                  type="number"
                  value={item.quantity || 0}
                />
              </FormField>
              <FormField>
                <FormLabel id="item-rate" label="Rate" />
                <Input
                  id={`item-rate-${itemIndex}`}
                  onChange={(value) =>
                    handleUpdateItem(itemIndex, "rate", value as number)
                  }
                  type="number"
                  value={item.rate || 0}
                />
              </FormField>
              <FormField>
                <FormLabel id="item-currency" label="Currency" />
                <Select
                  id={`item-currency-${itemIndex}`}
                  onChange={(value) =>
                    handleUpdateItem(itemIndex, "currency", value)
                  }
                  options={[
                    { value: "RM", label: "MYR" },
                    { value: "USD", label: "USD" },
                  ]}
                  value={item.currency || currency || "RM"}
                />
              </FormField>
              <FormField>
                <FormLabel id="item-amount" label="Amount" />
                <Input
                  disabled
                  className="tabular-nums"
                  id={`item-amount-${itemIndex}`}
                  type="text"
                  value={formatCurrency(
                    item.quantity * item.rate || 0,
                    item.currency || currency || "RM"
                  )}
                />
              </FormField>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <FormLabel id="item-details" label="Details" />
                <Button
                  icon={<PlusIcon size={18} />}
                  onClick={() => handleAddItemDetail(itemIndex)}
                  size="sm"
                  variant="ghost"
                >
                  Add Detail
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {item.details.map((detail, detailIndex) => (
                  <div
                    className="flex items-center gap-2"
                    // biome-ignore lint/suspicious/noArrayIndexKey: Details are not reordered, stable index prevents focus loss
                    key={`detail-${itemIndex}-${detailIndex}`}
                  >
                    <Input
                      id={`item-detail-${itemIndex}-${detailIndex}`}
                      onChange={(value) =>
                        handleUpdateItemDetail(
                          itemIndex,
                          detailIndex,
                          value as string
                        )
                      }
                      placeholder="Enter detail"
                      value={detail}
                    />
                    <Button
                      aria-label={`Remove detail ${detailIndex + 1}`}
                      icon={<TrashIcon size={18} />}
                      onClick={() =>
                        handleRemoveItemDetail(itemIndex, detailIndex)
                      }
                      size="sm"
                      variant="ghost"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
