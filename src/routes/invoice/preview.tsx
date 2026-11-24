import { Button, EmptyState, Surface } from "@irshadnazree/just-things-ui";
import { ArrowUUpLeftIcon, PrinterIcon } from "@phosphor-icons/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { PageHeader } from "@/components/shared/page-header";
import { formatDecimal, generatePrintFilename } from "@/lib/utils";
import { useInvoiceStore } from "@/stores/invoice-store";
import { numberToWords } from "@/utils/format";

export const Route = createFileRoute("/invoice/preview")({
  component: RouteComponent,
});

function RouteComponent() {
  const { formData } = useInvoiceStore();
  const navigate = useNavigate();

  const subtotal = formData.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
  const total = subtotal - (formData.reductionAmount || 0);

  const hasDocument = formData.id !== "";

  function goBack() {
    void navigate({
      to: "/invoice/$invoice",
      params: { invoice: formData.id || "new" },
    });
  }

  function printInvoice() {
    const originalTitle = document.title;
    const printTitle = generatePrintFilename(
      formData.invoiceFrom.company || "",
      formData.invoiceTo.company || "",
      formData.invoiceId || ""
    );
    document.title = printTitle;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  }

  return (
    <section className="document-preview-page flex flex-col gap-5">
      <PageHeader
        actions={
          hasDocument && (
            <Button onClick={printInvoice} variant="primary">
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
        title="Invoice preview"
      />

      {!hasDocument && (
        <Surface variant="dashed">
          <EmptyState
            actions={
              <Button onClick={goBack} variant="primary">
                Create invoice
              </Button>
            }
            description="Open an invoice from the list, or create a new one to see it here."
            title="Nothing to preview yet"
          />
        </Surface>
      )}

      {hasDocument && (
        <div className="document-preview-shell w-full overflow-x-auto pr-px font-sans max-sm:text-sm">
          <div className="border border-black bg-white text-black sm:min-w-150">
            <div className="border-black border-b p-4">
              <div className="flex items-center justify-start">
                <h2 className="font-normal text-4xl">Invoice</h2>
              </div>
            </div>

            <div className="border-black border-b">
              <table className="w-full border-collapse">
                <tbody>
                  <tr className="border-black border-b">
                    <td className="w-1/3 border-black align-top max-sm:block max-sm:w-full max-sm:border-b sm:border-r p-3 max-sm:p-2">
                      <div className="mb-4 font-bold">Invoice Details</div>
                      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
                        <div className="font-bold">Invoice No #</div>
                        <div className="tabular-nums">{formData.invoiceId}</div>
                      </div>
                      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
                        <div className="font-bold">Invoice Date</div>
                        <div>{formData.invoiceDate}</div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <div className="font-bold">Bank Account Number</div>
                        <div>{formData.bankAccount}</div>
                      </div>
                    </td>
                    <td className="w-1/3 border-black align-top max-sm:block max-sm:w-full max-sm:border-b sm:border-r p-3 max-sm:p-2">
                      <div className="mb-4 font-bold">Billed By</div>
                      <div className="mb-1 font-medium">
                        {formData.invoiceFrom.company}
                      </div>
                    </td>
                    <td className="w-1/3 align-top max-sm:block max-sm:w-full p-3 max-sm:p-2">
                      <div className="mb-4 font-bold">Billed To</div>
                      <div className="mb-1 font-medium">
                        {formData.invoiceTo.company}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2" colSpan={3}>
                      &nbsp;
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr className="border-black border-b">
                  <th className="w-1/25 border-black border-r p-3 max-sm:p-2 text-left" />
                  <th className="w-61/100 border-black border-r p-3 max-sm:p-2 text-left">
                    Item
                  </th>
                  <th className="w-1/10 border-black border-r p-3 text-center max-sm:hidden">
                    Quantity
                  </th>
                  <th className="w-1/10 border-black border-r p-3 text-center max-sm:hidden">
                    Rate
                  </th>
                  <th className="w-3/20 p-3 max-sm:p-2 text-center">Amount</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => (
                  <tr
                    className="border-black border-b"
                    key={`item-${index}-${item.name}`}
                  >
                    <td className="border-black border-r p-3 max-sm:p-2 text-center align-top">
                      {index + 1}.
                    </td>
                    <td className="border-black border-r p-3 max-sm:p-2 align-top">
                      <span className="mb-2 block">{item.name}</span>
                      <span className="mb-2 block tabular-nums sm:hidden">
                        {item.quantity} × {item.currency || formData.currency}{" "}
                        {item.rate}
                      </span>
                      {item.details.length > 0 && (
                        <ul className="ml-4 list-disc space-y-1 text-sm">
                          {item.details.map((detail, idx) => (
                            <li key={`detail-${index}-${idx}-${detail}`}>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="border-black border-r p-3 text-center align-top max-sm:hidden">
                      {item.quantity}
                    </td>
                    <td className="border-black border-r p-3 text-center align-top tabular-nums max-sm:hidden">
                      {item.currency || formData.currency} {item.rate}
                    </td>
                    <td className="whitespace-nowrap p-3 max-sm:p-2 text-center align-top tabular-nums">
                      {item.currency || formData.currency}{" "}
                      {formatDecimal(item.quantity * item.rate, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-black border-b">
                  <td className="p-2 max-sm:hidden" colSpan={5}>
                    &nbsp;
                  </td>
                  <td className="p-2 sm:hidden" colSpan={3}>
                    &nbsp;
                  </td>
                </tr>

                <tr className="border-black border-b">
                  <td />
                  <td className="max-sm:hidden" colSpan={2} />
                  <td className="whitespace-nowrap border-black border-r border-l p-3 max-sm:p-2 text-center font-bold">
                    Reductions
                  </td>
                  <td className="whitespace-nowrap p-3 max-sm:p-2 text-center tabular-nums">
                    ({formData.currency}{" "}
                    {formatDecimal(formData.reductionAmount || 0, 2)})
                  </td>
                </tr>

                <tr className="border-black border-b">
                  <td />
                  <td className="max-sm:hidden" colSpan={2} />
                  <td className="whitespace-nowrap border-black border-r border-l p-3 max-sm:p-2 text-center font-bold">
                    Total ({formData.currency})
                  </td>
                  <td className="whitespace-nowrap p-3 max-sm:p-2 text-center font-bold tabular-nums">
                    {formData.currency} {formatDecimal(total, 2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="p-4">
              <span className="font-bold">Total (in words) : </span>
              <span className="capitalize">
                {numberToWords(total)}{" "}
                {formData.currency === "RM" ? "Ringgit Only" : "Dollars Only"}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
