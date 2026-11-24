import {
  Button,
  Field,
  Input,
  NumberField,
  Select,
  Surface,
} from "@irshadnazree/just-things-ui";
import { CopyIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";

import { SectionHeading } from "@/components/shared/page-header";
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

// WARNING: Show cents, but never round what's stored: Base UI rounds to maximumFractionDigits on blur
const MONEY_FORMAT = { minimumFractionDigits: 2, maximumFractionDigits: 20 };
const EXACT_FORMAT = { maximumFractionDigits: 20 };

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

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading
        action={
          items.length > 0 && (
            <Button onClick={() => addItem()} size="sm" variant="link">
              <PlusIcon size={14} weight="bold" />
              Add item
            </Button>
          )
        }
      >
        Line items
      </SectionHeading>
      <div className="flex flex-col gap-4">
        {items.length === 0 && (
          <Surface
            className="flex flex-col items-center justify-center"
            variant="dashed"
          >
            <Button onClick={() => addItem()} size="sm">
              <PlusIcon size={14} weight="bold" />
              Add a line item
            </Button>
          </Surface>
        )}
        {items.map((item, itemIndex) => {
          const itemNumber = itemIndex + 1;
          const itemCurrency = item.currency || currency || "RM";

          return (
            <Surface
              className="flex flex-col gap-4"
              key={`item-${itemNumber}`}
              render={<article aria-label={`Item ${itemNumber}`} />}
            >
              <div className="flex items-center justify-between">
                <h3 className="jt-label">Item {itemNumber}</h3>
                <div className="flex items-center gap-1">
                  <Button
                    aria-label={`Duplicate item ${itemNumber}`}
                    iconOnly
                    onClick={() => duplicateItem(itemIndex)}
                    size="sm"
                    title="Duplicate"
                    variant="ghost"
                  >
                    <CopyIcon size={14} />
                  </Button>
                  <Button
                    aria-label={`Remove item ${itemNumber}`}
                    iconOnly
                    onClick={() => removeItem(itemIndex)}
                    size="sm"
                    title="Remove"
                    variant="ghost"
                  >
                    <TrashIcon size={14} />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <Field className="col-span-2 xl:col-span-3" label="Item name">
                  <Input
                    onValueChange={(value) =>
                      updateItem(itemIndex, "name", value)
                    }
                    value={item.name}
                  />
                </Field>
                <Field label="Code">
                  <Input
                    inputClassName="jt-mono"
                    onValueChange={(value) =>
                      updateItem(itemIndex, "code", value)
                    }
                    value={item.code}
                  />
                </Field>
                <Field label="Quantity">
                  <NumberField
                    format={EXACT_FORMAT}
                    onValueChange={(value) =>
                      updateItem(itemIndex, "quantity", value ?? 0)
                    }
                    value={item.quantity || 0}
                  />
                </Field>
                <Field label="Rate">
                  <NumberField
                    format={MONEY_FORMAT}
                    onValueChange={(value) =>
                      updateItem(itemIndex, "rate", value ?? 0)
                    }
                    value={item.rate || 0}
                  />
                </Field>
                <Field label="Currency">
                  <Select
                    onChange={(event) =>
                      updateItem(itemIndex, "currency", event.target.value)
                    }
                    value={itemCurrency}
                  >
                    <option value="RM">MYR</option>
                    <option value="USD">USD</option>
                  </Select>
                </Field>
                <Field label="Amount">
                  <Input
                    inputClassName="jt-mono jt-num"
                    readOnly
                    value={formatCurrency(
                      item.quantity * item.rate || 0,
                      itemCurrency
                    )}
                  />
                </Field>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h4 className="jt-label">Details</h4>
                  <Button
                    onClick={() => addItemDetail(itemIndex)}
                    size="sm"
                    variant="link"
                  >
                    <PlusIcon size={14} weight="bold" />
                    Add detail
                  </Button>
                </div>
                {item.details.map((detail, detailIndex) => (
                  <div
                    className="flex items-center gap-2"
                    key={`detail-${itemIndex}-${detailIndex}`}
                  >
                    <Input
                      aria-label={`Item ${itemNumber} detail ${detailIndex + 1}`}
                      className="flex-1"
                      onValueChange={(value) =>
                        updateItemDetail(itemIndex, detailIndex, value)
                      }
                      placeholder="Enter detail"
                      value={detail}
                    />
                    <Button
                      aria-label={`Remove detail ${detailIndex + 1}`}
                      iconOnly
                      onClick={() => removeItemDetail(itemIndex, detailIndex)}
                      size="sm"
                      title="Remove detail"
                      variant="ghost"
                    >
                      <TrashIcon size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </Surface>
          );
        })}
      </div>
    </section>
  );
}
