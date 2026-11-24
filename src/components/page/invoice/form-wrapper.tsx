import LineItemSection from "@/components/page/invoice/line-item-section";
import ProjectDetailsSection from "@/components/page/invoice/project-details-section";
import SummarySection from "@/components/page/invoice/summary-section";
import {
  useInvoiceUpdateField,
  useInvoiceUpdateNestedField,
} from "@/stores/invoice-store";

export default function FormWrapper() {
  const updateField = useInvoiceUpdateField();
  const updateNestedField = useInvoiceUpdateNestedField();

  return (
    <div className="flex flex-col gap-6">
      <ProjectDetailsSection
        onUpdateField={updateField}
        onUpdateNestedField={updateNestedField}
      />
      <LineItemSection />
      <SummarySection onUpdateField={updateField} />
    </div>
  );
}
