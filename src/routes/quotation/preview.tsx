import { Button, EmptyState, Surface } from "@irshadnazree/just-things-ui";
import { ArrowUUpLeftIcon, PrinterIcon } from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { PageHeader } from "@/components/shared/page-header";
import { formatDecimal, generatePrintFilename } from "@/lib/utils";
import { useQuotationData } from "@/stores/quotation-store";
import {
  getDepositByCurrency,
  getFinalPaymentByCurrency,
  getSecondPaymentByCurrency,
  getTotalByCurrency,
} from "@/utils/calculations";

export const Route = createFileRoute("/quotation/preview")({
  component: RouteComponent,
});

function renderPaymentRow(params: {
  label: string;
  value: number;
  currency: string;
  percent?: number;
  isBold?: boolean;
  key: string;
}) {
  return (
    <tr className="border-black border-b" key={params.key}>
      <td />
      <td className="max-sm:hidden" />
      <td className="max-sm:hidden" />
      <td
        className={`whitespace-nowrap border-black border-x p-3 max-sm:p-2 text-left ${params.isBold ? "font-bold" : ""}`}
      >
        {params.label}
        {params.percent !== undefined && <span> ({params.percent}%)</span>}
      </td>
      <td
        className={`whitespace-nowrap p-3 max-sm:p-2 text-left tabular-nums ${params.isBold ? "font-bold" : ""}`}
      >
        {params.currency} {formatDecimal(params.value, 2)}
      </td>
    </tr>
  );
}

function RouteComponent() {
  const formData = useQuotationData();
  const navigate = useNavigate();

  const totalsByCurrency = getTotalByCurrency(formData.items);
  const depositsByCurrency = getDepositByCurrency(
    formData.paymentType,
    formData.depositPercent,
    totalsByCurrency
  );
  const secondPaymentsByCurrency = getSecondPaymentByCurrency(
    formData.hasSecondPayment,
    formData.secondPaymentPercent,
    totalsByCurrency
  );
  const finalPaymentsByCurrency = getFinalPaymentByCurrency(
    totalsByCurrency,
    depositsByCurrency,
    secondPaymentsByCurrency
  );
  const currencies = Object.keys(totalsByCurrency);

  const hasDocument = formData.id !== "";

  function goBack() {
    void navigate({
      to: "/quotation/$quotation",
      params: { quotation: formData.id || "new" },
    });
  }

  function printQuotation() {
    const originalTitle = document.title;
    const printTitle = generatePrintFilename(
      formData.quotationFrom.company || "",
      formData.quotationFor.company || "",
      formData.quotationId || ""
    );
    document.title = printTitle;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  }

  function calculateFinalPaymentPercent() {
    if (formData.paymentType === "Recurring payment") {
      return formData.hasSecondPayment
        ? 100 - formData.secondPaymentPercent
        : 100;
    }
    if (formData.hasSecondPayment) {
      return 100 - formData.depositPercent - formData.secondPaymentPercent;
    }
    return 100 - formData.depositPercent;
  }

  function renderCurrencyFooter(currency: string) {
    const finalPaymentPercent = calculateFinalPaymentPercent();
    const rows = [
      renderPaymentRow({
        label: "Total",
        value: totalsByCurrency[currency],
        currency,
        isBold: true,
        key: `total-${currency}`,
      }),
    ];

    if (formData.paymentType !== "Recurring payment") {
      rows.push(
        renderPaymentRow({
          label: "Deposit",
          value: depositsByCurrency[currency] ?? 0,
          currency,
          percent: formData.depositPercent,
          key: `deposit-${currency}`,
        })
      );
    }

    if (formData.hasSecondPayment) {
      rows.push(
        renderPaymentRow({
          label: "Second Payment",
          value: secondPaymentsByCurrency[currency] ?? 0,
          currency,
          percent: formData.secondPaymentPercent,
          key: `second-${currency}`,
        })
      );
    }

    rows.push(
      renderPaymentRow({
        label: "Final Payment",
        value: finalPaymentsByCurrency[currency] ?? 0,
        currency,
        percent: finalPaymentPercent,
        key: `final-${currency}`,
      })
    );

    return rows;
  }

  return (
    <section className="document-preview-page flex flex-col gap-5">
      <PageHeader
        actions={
          hasDocument && (
            <Button onClick={printQuotation} variant="primary">
              <PrinterIcon size={16} weight="bold" />
              Print / PDF
            </Button>
          )
        }
        className="print:hidden"
        leading={
          <Button
            aria-label="Back to the editor"
            iconOnly
            onClick={goBack}
            variant="ghost"
          >
            <ArrowUUpLeftIcon size={16} weight="bold" />
          </Button>
        }
        title="Quotation preview"
      />

      {!hasDocument && (
        <Surface variant="dashed">
          <EmptyState
            actions={
              <Button onClick={goBack} variant="primary">
                Create quotation
              </Button>
            }
            description="Open a quotation from the list, or create a new one to see it here."
            title="Nothing to preview yet"
          />
        </Surface>
      )}

      {hasDocument && (
        <div className="document-preview-shell w-full overflow-x-auto pr-px font-sans max-sm:text-sm">
          <div className="border-2 border-black bg-white text-black sm:min-w-150">
            <div className="border-black border-b-2 p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-2xl">
                  {formData.projectTitle || "Quotation"}
                </h2>
                <div className="flex gap-2">
                  <span className="self-center text-black/60">
                    {formData.paymentType}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-black border-b-2">
              <table className="w-full">
                <tbody>
                  <tr className="border-black border-b">
                    <td className="border-black border-r p-3 max-sm:p-2">
                      <div className="text-sm">
                        <strong>Quotation No #</strong>
                      </div>
                      <div className="tabular-nums">{formData.quotationId}</div>
                    </td>
                    <td className="border-black p-3 max-sm:p-2">
                      <div className="text-sm">
                        <strong>Quotation Date</strong>
                      </div>
                      <div>{formData.quotationDate}</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="border-black border-r p-3 max-sm:p-2">
                      <div className="text-sm">
                        <strong>Quotation From</strong>
                      </div>
                      <div>{formData.quotationFrom.company}</div>
                    </td>
                    <td className="p-3 max-sm:p-2">
                      <div className="text-sm">
                        <strong>Quotation For</strong>
                      </div>
                      <div>{formData.quotationFor.company}</div>
                    </td>
                  </tr>
                  <tr className="border-black border-t">
                    <td className="p-3 max-sm:p-2" colSpan={2}>
                      <div className="text-sm">
                        <strong>Bank Account Number</strong>
                      </div>
                      <div>{formData.bankAccount}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-black border-b-2">
                  <th className="w-10 border-black border-r p-3 max-sm:p-2 text-left" />
                  <th className="border-black border-r p-3 max-sm:p-2 text-left">
                    Item
                  </th>
                  <th className="w-32 border-black border-r p-3 text-center max-sm:hidden">
                    Quantity <br />
                    (Work Day)
                  </th>
                  <th className="w-32 border-black border-r p-3 text-left max-sm:hidden">
                    Rate
                  </th>
                  <th className="w-32 max-sm:w-auto p-3 max-sm:p-2 text-left">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr
                    className="border-black border-b"
                    key={`item-${index}-${item.name}`}
                  >
                    <td className="border-black border-r p-3 max-sm:p-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border-black border-r p-3 max-sm:p-2">
                      <span className="mb-2 font-semibold">{item.name}</span>
                      <span className="mb-2 block tabular-nums sm:hidden">
                        {item.quantity} × {item.currency || formData.currency}{" "}
                        {item.rate}
                      </span>
                      {item.details.length > 0 && (
                        <ul className="list-inside list-disc space-y-1 text-sm">
                          {item.details.map((detail, idx) => (
                            <li key={`detail-${index}-${idx}-${detail}`}>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="border-black border-r p-3 text-center max-sm:hidden">
                      {item.quantity}
                    </td>
                    <td className="border-black border-r p-3 text-left tabular-nums max-sm:hidden">
                      {item.currency || formData.currency} {item.rate}
                    </td>
                    <td className="whitespace-nowrap p-3 max-sm:p-2 text-left tabular-nums">
                      {item.currency || formData.currency}{" "}
                      {formatDecimal(item.quantity * item.rate, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {currencies.flatMap((currency) =>
                  renderCurrencyFooter(currency)
                )}
              </tfoot>
            </table>

            <div className="p-3 max-sm:p-2">
              <h3 className="mb-2 font-bold">Terms and Conditions</h3>
              <ol className="space-y-1">
                {formData.terms.map((term, index) => (
                  <li className="text-sm" key={`term-${index}`}>
                    {index + 1}. {term}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
