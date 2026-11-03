import { Card } from "@/components/ui/Card";
import { FormField, FormLabel } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
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
    <div className="flex flex-col gap-3">
      <h3 className="border-text border-b-2 pb-2 font-semibold text-lg">
        Summary
      </h3>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <FormField>
          <FormLabel id="currency" label="Currency" />
          <Select
            id="currency"
            onChange={(value) => onUpdateField("currency", value as string)}
            options={[
              { value: "RM", label: "MYR" },
              { value: "USD", label: "USD" },
            ]}
            value={currency}
          />
        </FormField>
        <FormField>
          <FormLabel id="reduction-amount" label="Reductions" />
          <Input
            id="reduction-amount"
            onChange={(value) =>
              onUpdateField("reductionAmount", Number(value))
            }
            type="number"
            value={reductionAmount}
          />
        </FormField>

        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card className="flex flex-col gap-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <div className="flex justify-between text-primary-text">
              <span>Reductions</span>
              <span className="tabular-nums">
                ({formatCurrency(reductionAmount, currency)})
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold text-xl">
              <span>Total ({currency})</span>
              <span className="tabular-nums">
                {formatCurrency(total, currency)}
              </span>
            </div>
            <div className="flex justify-between text-xl">
              <div className="mb-1 font-semibold">Total (in words):</div>
              <div className="text-lg capitalize">
                {numberToWords(total)}{" "}
                {currency === "RM" ? "Ringgit Only" : "Dollars Only"}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
