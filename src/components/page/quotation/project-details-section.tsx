import { Field, Input, Select } from "@irshadnazree/just-things-ui";
import { memo } from "react";

import { SectionHeading } from "@/components/shared/page-header";
import { openDatePicker } from "@/lib/date-input";
import { useQuotationData } from "@/stores/quotation-store";
import type { QuotationStore } from "@/types/quotation";

type ProjectDetailsSectionProps = {
  onUpdateField: QuotationStore["updateField"];
  onUpdateNestedField: QuotationStore["updateNestedField"];
};

function ProjectDetailsSectionComponent({
  onUpdateField,
  onUpdateNestedField,
}: ProjectDetailsSectionProps) {
  const formData = useQuotationData();
  const {
    projectTitle,
    quotationId,
    quotationDate,
    paymentType,
    bankAccount,
    quotationFrom,
    quotationFor,
  } = formData;

  return (
    <>
      <section className="flex flex-col gap-4">
        <SectionHeading>Project details</SectionHeading>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Field className="xl:col-span-2" label="Project title">
            <Input
              onValueChange={(value) => onUpdateField("projectTitle", value)}
              value={projectTitle}
            />
          </Field>
          <Field label="Quotation no.">
            <Input
              inputClassName="jt-mono"
              onValueChange={(value) => onUpdateField("quotationId", value)}
              value={quotationId}
            />
          </Field>
          <Field label="Quotation date">
            <Input
              onClick={openDatePicker}
              onValueChange={(value) => onUpdateField("quotationDate", value)}
              type="date"
              value={quotationDate}
            />
          </Field>
          <Field label="Payment type">
            <Select
              onChange={(event) =>
                onUpdateField(
                  "paymentType",
                  event.target.value as typeof paymentType
                )
              }
              value={paymentType}
            >
              <option value="One-time payment">One-time payment</option>
              <option value="Recurring payment">Recurring payment</option>
            </Select>
          </Field>
          <Field label="Bank account number">
            <Input
              inputClassName="jt-mono"
              onValueChange={(value) => onUpdateField("bankAccount", value)}
              value={bankAccount}
            />
          </Field>
        </div>
      </section>
      <section className="flex flex-col gap-4">
        <SectionHeading>Client</SectionHeading>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Field label="Quotation from">
            <Input
              onValueChange={(value) =>
                onUpdateNestedField("quotationFrom", "company", value)
              }
              value={quotationFrom.company}
            />
          </Field>
          <Field label="Quotation for">
            <Input
              onValueChange={(value) =>
                onUpdateNestedField("quotationFor", "company", value)
              }
              value={quotationFor.company}
            />
          </Field>
        </div>
      </section>
    </>
  );
}

export default memo(ProjectDetailsSectionComponent);
