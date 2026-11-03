import { useQuotationCalculations } from "@/components/hooks/use-quotation-calculations";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField, FormLabel } from "@/components/ui/Form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn, formatDecimal } from "@/lib/utils";
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
    <div className="flex flex-col gap-3">
      <h3 className="border-text border-b-2 pb-2 font-semibold text-lg">
        Payment Details
      </h3>
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4 xl:gap-4">
        <FormField className="col-span-2">
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
        <FormField
          className={cn(hasSecondPayment ? "col-span-1" : "col-span-2")}
        >
          <FormLabel id="deposit-percent" label="Deposit Percentage (%)" />
          <Input
            id="deposit-percent"
            onChange={(value) => onUpdateField("depositPercent", Number(value))}
            type="number"
            value={depositPercent}
          />
        </FormField>
        {hasSecondPayment && (
          <FormField>
            <FormLabel
              id="second-payment-percent"
              label="Second Payment Percentage (%)"
            />
            <Input
              id="second-payment-percent"
              onChange={(value) =>
                onUpdateField("secondPaymentPercent", value as number)
              }
              type="number"
              value={secondPaymentPercent || 0}
            />
          </FormField>
        )}
      </div>
      <FormField>
        <Checkbox
          checked={hasSecondPayment}
          id="has-second-payment"
          label="Enable Second Payment Option"
          onChange={(checked) => onUpdateField("hasSecondPayment", checked)}
        />
      </FormField>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {currencies.map((currencyKey) => (
            <div className="flex flex-col gap-2" key={currencyKey}>
              <div className="font-semibold">{currencyKey} Totals</div>
              <Card
                className={cn(
                  "grid gap-2 xl:gap-0",
                  paymentType !== "Recurring payment" && hasSecondPayment
                    ? "grid-cols-2 xl:grid-cols-4"
                    : "grid-cols-2 xl:grid-cols-3",
                  paymentType === "Recurring payment" && "grid-cols-2"
                )}
              >
                <div>
                  <div className="mb-1 text-sm">Total</div>
                  <div className="font-bold text-xl">
                    {currencyKey}{" "}
                    {formatDecimal(totalsByCurrency[currencyKey], 2)}
                  </div>
                </div>
                {paymentType !== "Recurring payment" && (
                  <div>
                    <div className="mb-1 text-sm">
                      Deposit ({depositPercent}%)
                    </div>
                    <div className="font-bold text-primary-text text-xl">
                      {currencyKey}{" "}
                      {formatDecimal(depositsByCurrency[currencyKey] ?? 0, 2)}
                    </div>
                  </div>
                )}
                {hasSecondPayment && (
                  <div>
                    <div className="mb-1 text-sm">
                      Second Payment ({secondPaymentPercent}%)
                    </div>
                    <div className="font-bold text-primary-text text-xl">
                      {currencyKey}{" "}
                      {formatDecimal(
                        secondPaymentsByCurrency[currencyKey] ?? 0,
                        2
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <div className="mb-1 text-sm">
                    Final Payment
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
                  <div className="font-bold text-primary-text text-xl">
                    {currencyKey}{" "}
                    {formatDecimal(
                      finalPaymentsByCurrency[currencyKey] ?? 0,
                      2
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
