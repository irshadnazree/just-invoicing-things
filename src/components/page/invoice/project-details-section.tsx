import { Field, Input } from "@irshadnazree/just-things-ui";
import { memo } from "react";

import { SectionHeading } from "@/components/shared/page-header";
import { openDatePicker } from "@/lib/date-input";
import { useInvoiceData } from "@/stores/invoice-store";
import type { InvoiceStore } from "@/types/invoice";

type ProjectDetailsSectionProps = {
  onUpdateField: InvoiceStore["updateField"];
  onUpdateNestedField: InvoiceStore["updateNestedField"];
};

function ProjectDetailsSectionComponent({
  onUpdateField,
  onUpdateNestedField,
}: ProjectDetailsSectionProps) {
  const formData = useInvoiceData();
  const { invoiceId, invoiceDate, bankAccount, invoiceFrom, invoiceTo } =
    formData;

  return (
    <>
      <section className="flex flex-col gap-4">
        <SectionHeading>Invoice details</SectionHeading>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Field label="Invoice no.">
            <Input
              inputClassName="jt-mono"
              onValueChange={(value) => onUpdateField("invoiceId", value)}
              value={invoiceId}
            />
          </Field>
          <Field label="Invoice date">
            <Input
              onClick={openDatePicker}
              onValueChange={(value) => onUpdateField("invoiceDate", value)}
              type="date"
              value={invoiceDate}
            />
          </Field>
          <Field className="xl:col-span-2" label="Bank account number">
            <Input
              inputClassName="jt-mono"
              onValueChange={(value) => onUpdateField("bankAccount", value)}
              value={bankAccount}
            />
          </Field>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <SectionHeading>Billing</SectionHeading>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Field label="Billed by">
            <Input
              onValueChange={(value) =>
                onUpdateNestedField("invoiceFrom", "company", value)
              }
              value={invoiceFrom.company}
            />
          </Field>
          <Field label="Billed to">
            <Input
              onValueChange={(value) =>
                onUpdateNestedField("invoiceTo", "company", value)
              }
              value={invoiceTo.company}
            />
          </Field>
        </div>
      </section>
    </>
  );
}

export default memo(ProjectDetailsSectionComponent);
