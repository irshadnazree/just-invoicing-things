import {
  Checkbox,
  Field,
  NumberField,
  Select,
  Surface,
} from "@irshadnazree/just-things-ui";

import { useQuotationCalculations } from "@/components/hooks/use-quotation-calculations";
import { SectionHeading } from "@/components/shared/page-header";
import { cn, formatDecimal } from "@/lib/utils";

// WARNING: Base UI rounds to maximumFractionDigits on blur; keep what's stored
const EXACT_FORMAT = { maximumFractionDigits: 20 };
import { useQuotationPaymentConfig } from "@/stores/quotation-store";
import type { QuotationStore } from "@/types/quotation";

type PaymentSectionProps = {
  onUpdateField: QuotationStore["updateField"];
};

export default function PaymentSection({ onUpdateField }: PaymentSectionProps) {
  const {
    currency,
    paymentType,
    depositPercent,
    hasSecondPayment,
    secondPaymentPercent,
  } = useQuotationPaymentConfig();

  const {
    totalsByCurrency,
    depositsByCurrency,
    secondPaymentsByCurrency,
    finalPaymentsByCurrency,
    currencies,
  } = useQuotationCalculations();

  return (
    <section className="flex flex-col gap-4">
      <SectionHeading>Payment details</SectionHeading>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Field className="col-span-2" label="Currency">
          <Select
            onChange={(event) => onUpdateField("currency", event.target.value)}
            value={currency}
          >
            <option value="RM">MYR</option>
            <option value="USD">USD</option>
          </Select>
        </Field>
        <Field
          className={cn(hasSecondPayment ? "col-span-1" : "col-span-2")}
          label="Deposit"
        >
          <NumberField
            format={EXACT_FORMAT}
            onValueChange={(value) =>
              onUpdateField("depositPercent", value ?? 0)
            }
            suffix="%"
            value={depositPercent}
          />
        </Field>
        {hasSecondPayment && (
          <Field label="Second payment">
            <NumberField
              format={EXACT_FORMAT}
              onValueChange={(value) =>
                onUpdateField("secondPaymentPercent", value ?? 0)
              }
              suffix="%"
              value={secondPaymentPercent || 0}
            />
          </Field>
        )}
      </div>
      <Checkbox
        checked={hasSecondPayment}
        className="self-start"
        label="Add a second payment"
        onCheckedChange={(checked) =>
          onUpdateField("hasSecondPayment", checked)
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {currencies.map((currencyKey) => (
            <div className="flex flex-col gap-2" key={currencyKey}>
              <h3 className="jt-label">{currencyKey} totals</h3>
              <Surface
                className={cn(
                  "grid gap-4",
                  paymentType !== "Recurring payment" && hasSecondPayment
                    ? "grid-cols-2 xl:grid-cols-4"
                    : "grid-cols-2 xl:grid-cols-3",
                  paymentType === "Recurring payment" && "grid-cols-2"
                )}
              >
                <div>
                  <div className="jt-muted mb-1 text-sm">Total</div>
                  <div className="jt-mono jt-num font-semibold text-lg">
                    {currencyKey}{" "}
                    {formatDecimal(totalsByCurrency[currencyKey], 2)}
                  </div>
                </div>
                {paymentType !== "Recurring payment" && (
                  <div>
                    <div className="jt-muted mb-1 text-sm">
                      Deposit ({depositPercent}%)
                    </div>
                    <div className="jt-mono jt-num font-semibold text-accent-text text-lg">
                      {currencyKey}{" "}
                      {formatDecimal(depositsByCurrency[currencyKey] ?? 0, 2)}
                    </div>
                  </div>
                )}
                {hasSecondPayment && (
                  <div>
                    <div className="jt-muted mb-1 text-sm">
                      Second payment ({secondPaymentPercent}%)
                    </div>
                    <div className="jt-mono jt-num font-semibold text-accent-text text-lg">
                      {currencyKey}{" "}
                      {formatDecimal(
                        secondPaymentsByCurrency[currencyKey] ?? 0,
                        2
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <div className="jt-muted mb-1 text-sm">
                    Final payment
                    {(() => {
                      if (paymentType === "Recurring payment") {
                        return hasSecondPayment
                          ? ` (${100 - secondPaymentPercent}%)`
                          : "";
                      }
                      if (hasSecondPayment) {
                        return ` (${100 - depositPercent - secondPaymentPercent}%)`;
                      }
                      return ` (${100 - depositPercent}%)`;
                    })()}
                  </div>
                  <div className="jt-mono jt-num font-semibold text-accent-text text-lg">
                    {currencyKey}{" "}
                    {formatDecimal(
                      finalPaymentsByCurrency[currencyKey] ?? 0,
                      2
                    )}
                  </div>
                </div>
              </Surface>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
