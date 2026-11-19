import {
  Field,
  NumberField,
  Select,
  Surface,
} from "@irshadnazree/just-things-ui";

import { SectionHeading } from "@/components/shared/page-header";
import { formatCurrency } from "@/lib/utils";
import {
  useInvoiceCurrency,
  useInvoiceItems,
  useInvoiceReduction,
} from "@/stores/invoice-store";
import { numberToWords } from "@/utils/format";

type SummarySectionProps = {
  onUpdateField: (field: string, value: unknown) => void;
};

// Show cents, but never round what's stored: Base UI rounds to maximumFractionDigits on blur
const MONEY_FORMAT = { minimumFractionDigits: 2, maximumFractionDigits: 20 };

export default function SummarySection({ onUpdateField }: SummarySectionProps) {
  const currency = useInvoiceCurrency();
  const reductionAmount = useInvoiceReduction();
  const items = useInvoiceItems();

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
  const total = subtotal - reductionAmount;

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading>Summary</SectionHeading>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Field label="Currency">
          <Select
            onChange={(event) => onUpdateField("currency", event.target.value)}
            value={currency}
          >
            <option value="RM">MYR</option>
            <option value="USD">USD</option>
          </Select>
        </Field>
        <Field label="Reductions">
          <NumberField
            format={MONEY_FORMAT}
            onValueChange={(value) =>
              onUpdateField("reductionAmount", value ?? 0)
            }
            value={reductionAmount}
          />
        </Field>

        <Surface className="flex flex-col gap-2 xl:col-span-2">
          <div className="flex justify-between gap-4">
            <span className="jt-muted">Subtotal</span>
            <span className="jt-mono jt-num">
              {formatCurrency(subtotal, currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="jt-muted">Reductions</span>
            <span className="jt-mono jt-num text-accent-text">
              ({formatCurrency(reductionAmount, currency)})
            </span>
          </div>
          <div className="flex justify-between gap-4 border-line border-t pt-2 font-semibold text-lg">
            <span>Total ({currency})</span>
            <span className="jt-mono jt-num">
              {formatCurrency(total, currency)}
            </span>
          </div>
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
            <span className="jt-muted">Total in words</span>
            <span className="capitalize">
              {numberToWords(total)}{" "}
              {currency === "RM" ? "Ringgit Only" : "Dollars Only"}
            </span>
          </div>
        </Surface>
      </div>
    </section>
  );
}
